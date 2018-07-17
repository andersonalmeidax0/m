/* *************************************************/
/************************ MUSIC MANIPULATION FUNCTIONS   ********************/
/************************ MUSIC MANIPULATION FUNCTIONS   ********************/
/* *************************************************/
var MM = function (){};
MM.prototype.getVersion=function () 
{ 
	return '1.0'; 
};


MM.prototype.help=function () 
{ 
//     console.log(MM.prototype[0]);
//     console.log(MM.prototype[1]);
//     console.log(MM.prototype);/
//	 for(i=0;i<MM.prototype.length;i++)
 //    console.log(MM.prototype[i]);
    //xpose : data string mml, faz tranpose de notas no formato de mmusic.
    //xbemol: dada string mml, faz bemol de notas especificadas no parametro 2 
     
};



MM.prototype.readfile= function (file1,csep,fs)
{
  var arrlines = [];
  var fileContents = fs.readFileSync(file1);
  var lines = fileContents.toString().split('\n');
  for (var i = 1; i < lines.length; i++) {
    arrlines.push(lines[i].toString().split(csep));
  }
  return arrlines;
}

function xassert(m,a,b)
{
  console.log('TEST:'+m+'  assert:('+a+') = ('+b+')');
  if(a==b)
  {
  console.log('----------------- UNIT OK -------------------');
    return true;
  }  
  else  
  {
    console.log('XXXXXXXXXX TEST:'+m+' assert:[ '+a+' ] = [ '+b+' ] XXXXXXXXXXXXX');
    console.log('XXXXXXXXXXXX UNIT TEST FAILED XXXXXXXXXXXXXXXXXXXX');
    process.  exit(0);
  }  
}    

MM.prototype.unittest=function () 
{
   console.log('Unit Testing: xpose');   
   xassert('xpose(cdef)',mm.xpose('cdef',1),'d-e-fg-');  
   xassert('xbemol(cdef)',mm.xbemol('cdef','cd'),'bd-ef');  
   xassert('xbemol2(cdef)',mm.xbemol2('cdef',2),'bdef');  
   /*
n$="1235"
n3$="321s"
n2$="1357"

print xpose$(pat$(n2$,"bo"),0)
print xpose$(pat$(n3$,"e7"),0)
print xpose$(pat$(n$,"am"),0)
print xpose$(pat$(n$,"d7"),0)
print xpose$(pat$(n2$,"gm"),0) 
print xpose$(pat$(n3$,"c7"),0) 
   */
   
   
}
/////////////////////////////////
/////////////////////////////////
///Utils para conversao
/////////////////////////////////
/////////////////////////////////
function list_search(arr,str)
{
  var i=0;
  for(i=0;i<arr.length;i++)
  {
    if(arr[i]===str)
     return i;
  }
  return -1;
}
function is_in(c,str)
{
  r=str.indexOf(c);
  xprint('is in r=',r);
  return r;
}

function mids(str,c1,len)
{
      //c$=mid$(n$,i,1)
  return str.substr(c1,len);
}

function xprint(s1,s2)
{
  console.log('DEB:'+s1+s2);
}
/////////////////////////////////
/////////////////////////////////
/////////////////////////////////

function xcnoteb()
{
   var cnoteb=[];
   cnoteb=[">c<",
           ">d-<",
           ">d<",
           ">e-<",
           ">e<",
           ">f<",
           ">g-<",
           ">g<",
           ">a-<",
           ">a<",
           ">b-<",
           ">b<",
           "c",
           "d-",
           "d",
           "e-",
           "e",
            "f",
            "g-",
            "g",
            "a-",
            "a",
            "b-",
            "b",
            "<c>",
            "<d->",
            "<d>",
            "<e->",
            "<e>",
            "<f>",
            "<g->",
            "<g>",
            "<a->",
            "<a>",
            "<b->",
            "<b>"];
            return cnoteb;
}
function xcnoteb9()
{
   var cnoteb=[];
   cnoteb=[
           "c",
           "d-",
           "d",
           "e-",
           "e",
            "f",
            "g-",
            "g",
            "a-",
            "a",
            "b-",
            "b",
           "c",
           "d-",
           "d",
           "e-",
           "e",
            "f",
            "g-",
            "g",
            "a-",
            "a",
            "b-",
            "b",
           "c",
           "d-",
           "d",
           "e-",
           "e",
            "f",
            "g-",
            "g",
            "a-",
            "a",
            "b-",
            "b",
           "c",
           "d-",
           "d",
           "e-",
           "e",
            "f",
            "g-",
            "g",
            "a-",
            "a",
            "b-",
            "b",
           "c",
           "d-",
           "d",
           "e-",
           "e",
            "f",
            "g-",
            "g",
            "a-",
            "a",
            "b-",
            "b",
            ];
            return cnoteb;
}


/////////////////////////////////////////
//HIPO: faz transpose, de Ns por x graus
/////////////////////////////////////////
MM.prototype.xpose=function (ns,x) 
{
   var cnoteb=xcnoteb();
   l=ns.length;
   rs="";
   o=0;
   //HIPO: loop de caracteres de ns
   var i=0;
   for(i=0;i<l;i++)
   {  
        xprint("****** i:",i);
      //c$=mid$(n$,i,1)
      cs=ns.substr(i,1);
      xprint('cs=',cs);
      //!print c$
      //HIPO:muda oitava
      if(cs==='<') o=o+1;
      if(cs==='>') o=o-1;
      //if c$="<" then o=o+1
      //if c$=">" then o=o-1
               
      //if is_in(c$,"abcdefg") <>0 then
      //HIPO:verifica de a nota eh valida
      //valid="abcdefg";
      //if(valid.indexOf(cs)>=0)
      // xprint("***pre is in*** i:",i);
      if(is_in(cs,"abcdefg")>=0)
      {
         //HIPO:verifica se eh bemol
         if(ns.substr(i+1,1)=='-')
         {
             cs=cs+'-';
             i=i+1;
         }
        //if mid$(n$,i+1,1)="-" then 
        //  c$=c$+"-"
        //  i=i+1
        //endif  
  
        //xprint("char:",cs);
        cos=cs;
  
        //co$=c$
        //if o=1 then co$="<"+c$+">"
        //if o=-1 then co$=">"+c$+"<"
        //
        if(o==1) cos="<"+cs+">";
        if(o==-1) cos=">"+cs+"<";
        // xprint("***pos ooo *** i:",i);
        //HIPO: busca o indice da nota corrente na string de notas e guarda em e  
        e=list_search(cnoteb,cos);
        // xprint("***poslist *** i:",i);
        xprint("indice da nota e=",e);
        //xprint("***pos print *** i:",i);
        e=e+x;
        xprint("ind e+x:",e);
        //list.get cnoteb,e,cx$
        //xprint("***pos e+x *** i:",i);
        cxs=cnoteb[e];
        xprint("xpose:",cxs);
        rs=rs+cxs;
        //xprint("****** i:",i);
      }
      else
      {
        //HIPO: faz append daquilo que nao eh reconhecido
        if(is_in(cs,"<>")==-1)
        {
          rs=rs+cs; 
        } 
      }
    }

//!print r$
    return  rs;
}


/////////////////////////////////////////
//HIPO: aplica bemois em notas especificadas (ex para mudar o modo, ex de jonio para dorio
/////////////////////////////////////////
MM.prototype.xbemol=function (ns,bs) 
{
   var cnoteb=xcnoteb9();
   l=ns.length;
   rs="";
   o=0;
   //HIPO: loop de caracteres de ns
   cs="";
//   for i=1 to l
   var i=0;
   for(i=0;i<l;i++)
   {  
        xprint("****** i:",i);
        cs=mids(ns,i,1)
        xprint('cs:',cs);
        //HIPO verifica se eh nota valida
      if(is_in(cs,"abcdefg")>=0)
      {
        
      //if is_in(c$,"abcdefg") <>0 then
         //HIPO:verifica se eh bemol
         if(cs.substr(i+1,1)=='-')
         {
             cs=cs+'-';
             i=i+1;
         }

       //if mid$(n$,i+1,1)="-" then 
       //   c$=c$+"-"
       //   i=i+1
       // endif  
        //HIPO: busca o indice da nota corrente na string de notas e guarda em e  
        e=list_search(cnoteb,cs);
      //list.search cnoteb,c$,e
        e=e+12;// %pula para meio
        //se a nota esta entre as notas bs quem devem ser alteradas....
        if(is_in(cs,bs)> -1)
        {
           e=e-1;
        } 
        //if is_in(c$,b$) <>0 then
        //   e=e-1
        //endif
        cx=cnoteb[e];
        rs=rs+cx;
        xprint("******",i);
      }  
      else
      {
        rs=rs+cs; 
      }  
    }
   return rs;
}

/////////////////////////////////////////
//HIPO: aplica bemois em notas especificadas (ex para mudar o modo, ex de jonio para dorio
/////////////////////////////////////////
MM.prototype.xbemol2=function (ns,cc) 
{
   var cnoteb=xcnoteb();
  var rs="";
  var e=0; 
  e=list_search(cnoteb,cc);
  //e=e-12;
  rs=mm.xpose(ns,e-1);
  return rs;
}

/*
! ---------------------------
! ---------------------------
! ---------------------------
fn.def xpat$(d$,g$)
Array.load cnotenam$[],~
">c<",">d<",">e<",~
">f<",">g<",">a<",">b<",~
"c","d","e",~
"f","g","a","b",~ 
"<c>","<d>","<e>",~
"<f>","<g>","<a>","<b>"~
"<<c>>","<<d>>","<<e>>",~
"<<f>>","<<g>>","<<a>>","<<b>>"

l=len(d$)
r$=""
!GERA em C
b=0 % todo: impl bemol
for i=1 to l 
j$=(mid$(d$,i,1))
if j$="s" then 
  c=0
else
  if j$="-" then %bemol
   b=-1
   !r$=r$+ "-"
   f_n.continue
  else
   print "pat:asc:",ascii(j$)
   if ascii(j$)>=ascii("c")~
   & ascii(j$)<=ascii("g") then
    c=ascii(j$)-ascii("c")+1+7  
   elseif~
     ascii(j$)>=ascii("a")~
   & ascii(j$)<=ascii("b") then
    c=ascii(j$)-ascii("a")+1+5+7
   elseif~
     ascii(j$)=ascii("*") then
     c=1+7+7
   else
      c=val(mid$(d$,i,1))
   endif
  endif
endif

print "pat:"+j$+":"+str$(c)
cn$=cnotenam$[c+7]
if b=-1 then 
   cn$=xputbemol$(cn$)
   b=0
endif
r$=r$+ cn$
next

tp$=mid$(g$,2,1)
ch$=mid$(g$,1,1)
!print tp$
REM acerta acorde

if tp$="7" then r$=xbemol$(r$,"b")
if tp$="a" then r$=xbemol$(r$,"dba")
if tp$="m" then r$=xbemol$(r$,"eb")
if tp$="o" then r$=xbemol$(r$,"degb")

REM faz transposicao
r$=xpose2$(r$,ch$)
!print r$
fn.rtn r$
fn.end
*/


//module.exports = new MM();
mm = new MM();
mm.unittest();

/*    
print "T120"
print "OctaveReverse"
print "l16"
print "C-Major"
nascdesc$="|dfa<c>|bagf|"
nascdesc$=~
xbemol$("|dfa<c>|bagf|","ea")
print xpose$( nascdesc$ ,2)
print xpose$( nascdesc$ ,0)
print xpose$( nascdesc$ ,-2)
print xpose$( nascdesc$+"cccc" ,-4)

console.save "notes.txt"
rem end
!!!!!!!!!!!!!!!!!!!!!! 

*/


