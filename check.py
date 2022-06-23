from multiprocessing.dummy import Array
import os
import time
import requests
from requests import get
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
from threading import Thread
import os

cpus = os.cpu_count()

def clean (data):
   res = []
   for i in data:
      if not i.strip() == "" and len(i.strip().split(":")) == 2 and len(i.strip().split(":")[0].strip().split(".")) == 4:
         res.append(i.strip())
   return res
def split(a, n):
    k, m = divmod(len(a), n)
    return (a[i*k+min(i, m):(i+1)*k+min(i+1, m)] for i in range(n))

uncheckedFile = "unchecked-list.txt"
invalidFile = "invalid-list.txt"
validFile = "valid-list.txt"
checkCount = 20

rawProx = open(uncheckedFile, "r").read().split("\n")
unCProx = clean(rawProx)
cProx = []
proxTotal = len(unCProx)
cekTotal = 0

for i in range(cpus):
   cProx.append(unCProx[0:checkCount])
   cekTotal += len(unCProx[0:checkCount])
   unCProx = unCProx[checkCount:]

open(uncheckedFile, "w").write("\n".join(unCProx))

print(f"found {proxTotal}, checking {cekTotal} proxies using {cpus} thread...")

def check (proxs:Array):
   for add in proxs:
      try:
         res = get("https://api.ipify.org", verify=False, proxies={"http":"http://"+add+"/", "https":"https://"+add+"/"}, timeout=60)
         if res.ok:
            print(f"found valid proxy: {add}")
            open(validFile, "a").write(add+"\n")
      except:
         try:
            res = get("http://api.ipify.org", verify=False, proxies={"http":"http://"+add+"/", "https":"https://"+add+"/"}, timeout=60)
            if res.ok:
               print(f"found valid proxy: {add}")
               open(validFile, "a").write(add+"\n")
         except requests.exceptions.RequestException  as e:
            msg = f"{add} | "+str(e.args[0].reason.args[-1]).split(":")[-1]
            print(msg)
            open(invalidFile, "a").write(msg)


def is_any_thread_alive(thr):
    return True in [t.is_alive() for t in thr]

threads = []
for i in range(cpus):
   print(f"Thread {i}, check {len(cProx[i])} accounts...")
   t = Thread(target=check, args=(cProx[i], ))
   t.daemon = True
   t.start()
   threads.append(t)

while is_any_thread_alive(threads):
    time.sleep(1)