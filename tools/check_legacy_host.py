"""Read-only service inventory for one server you own. Python 3.8+, no packages.
Checks eleven common TCP ports. No login, password guesses, GM calls or redirects.
"""
import argparse,concurrent.futures,html,ipaddress,json,re,socket,urllib.error,urllib.request
PORTS=(22,80,443,3000,3389,5000,8000,8022,8080,8443,20003)

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,request,fp,code,msg,headers,newurl):return None

def http_info(host,port):
    scheme='https'if port in (443,8443)else'http'
    request=urllib.request.Request('{}://{}:{}/'.format(scheme,host,port),headers={'User-Agent':'DB2-Owner-Recovery-Check/1.0'})
    opener=urllib.request.build_opener(NoRedirect())
    try:
        try:response=opener.open(request,timeout=3)
        except urllib.error.HTTPError as error:response=error
        with response:
            result={'status':response.code,'content_type':response.headers.get('Content-Type',''),'server_header':response.headers.get('Server','')}
            body=response.read(8192).decode('utf-8',errors='replace')
            title=re.search(r'<title[^>]*>(.*?)</title>',body,re.I|re.S)
            if title:result['page_title']=html.unescape(re.sub('<[^>]+>','',title.group(1))).strip()[:160]
            if response.code in (301,302,303,307,308):result['redirect_not_followed']=True
            return result
    except (OSError,ValueError)as error:return {'error':str(error)[:220]}

def probe(host,port):
    result={'port':port,'tcp_open':False}
    try:
        with socket.create_connection((host,port),timeout=2)as conn:
            result['tcp_open']=True
            if port in (22,8022):
                conn.settimeout(2)
                try:result['ssh_banner']=conn.recv(256).decode('ascii',errors='replace').splitlines()[0][:160]
                except (OSError,IndexError):result['ssh_banner']='No banner received'
        if port not in (22,8022,3389):result['http']=http_info(host,port)
    except OSError:result['state']='closed_or_unreachable_or_filtered'
    return result

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--host',required=True,help='One IPv4 address of your own server');args=parser.parse_args()
    try:
        address=ipaddress.ip_address(args.host)
        if address.version!=4:raise ValueError('IPv4 required')
    except ValueError:parser.error('Use one IPv4 address, without a URL, port or subnet')
    host=str(address);print('Checking one host:',host,flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=2)as pool:results=list(pool.map(lambda p:probe(host,p),PORTS))
    print(json.dumps({'host':host,'read_only':True,'authentication_attempted':False,'gm_requests_sent':False,'ports':results},ensure_ascii=False,indent=2))
    print('An open port does not provide admin rights. Closed/unreachable can also mean a Tailscale ACL or firewall block.')
if __name__=='__main__':main()
