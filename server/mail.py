"""Mailbox operations with account ownership and one-time attachment claims."""
import secrets,time
from .state import integer,snapshot,delta
from .adventure import grant
from .social import profile_by_id
ROUTES={'logic.mailHandler.'+x for x in ('read','receive','receiveAll','removeAllRead','send')}

def handle(store,account,route,args):
    action=route.rsplit('.',1)[-1]
    with store.transaction():
        p=store.player(account)
        if not p:raise ValueError('Chưa có nhân vật')
        before=snapshot(p);mails=p['extra']['mails'];temp={}
        if action=='send':
            target=integer(args.get('targetId'),'Người nhận',1);other=profile_by_id(store,target);content=args.get('content')
            if target==p['id']:raise ValueError('Không thể tự gửi thư')
            if not isinstance(content,str) or not content.strip() or len(content)>500 or any(ord(c)<32 and c!='\n' for c in content):raise ValueError('Nội dung thư không hợp lệ')
            if '<' in content or '>' in content:raise ValueError('Nội dung không được chứa thẻ định dạng')
            if len(other['extra']['mails'])>=200:raise ValueError('Hộp thư người nhận đã đầy')
            import json
            recent=sum(json.loads(row[0]).get('player')==p['id'] for row in store.db.execute("SELECT detail FROM audit WHERE action='send_mail' AND created>?",(int(time.time())-60,)))
            if recent>=10:raise ValueError('Gửi thư quá nhanh')
            mail={'_id':secrets.token_hex(12),'senderId':p['id'],'senderName':p['name'],'title':p['name'],'body':content.strip(),'status':1,'isSys':False,'dropList':[],'ctime':int(time.time()*1000)}
            other['extra']['mails'].append(mail);store.save(other);store.notify(other['userId'],'onNewMail',{'mail':mail});store.audit('send_mail',{'player':p['id'],'target':target})
        elif action=='removeAllRead':p['extra']['mails']=[m for m in mails if m['status']!=2]
        else:
            if action=='receiveAll':selected=[m for m in mails if m['status']==1 and m['dropList']]
            else:
                mid=args.get('mailId')
                if not isinstance(mid,(str,int)):raise ValueError('ID thư không hợp lệ')
                selected=[m for m in mails if str(m['_id'])==str(mid)]
            if not selected:raise ValueError('Không có thư hoặc phần thưởng có thể nhận')
            rewards=[]
            for m in selected:
                if m['status']!=1:raise ValueError('Thư đã được xử lý')
                if action=='read' and m['dropList']:raise ValueError('Cần nhận đính kèm của thư')
                if action in ('receive','receiveAll'):
                    if 'isSys'in args and bool(args['isSys'])!=bool(m.get('isSys')):raise ValueError('Loại thư không khớp')
                    rewards.extend(m['dropList'])
                m['status']=2
            if rewards:temp['entityCountMap']=grant(p,rewards)
        store.save(p)
        if action!='send':store.audit('mail_'+action,{'player':p['id']})
        result=delta(before,p,route,temp)
        return result
