/* *************************************************/
/* *************************************************/
/************************ DATA MANIPULATION FUNCTIONS   ********************/
/************************ DATA MANIPULATION FUNCTIONS   ********************/
/************************ DATA MANIPULATION FUNCTIONS   ********************/
/************************ DATA MANIPULATION FUNCTIONS   ********************/
/* *************************************************/
/* *************************************************/
/* Le arquivo e coloca num array de linhas */
/* *************************************************/
var DM = function (){};
DM.prototype.getVersion=function () 
{ 
	return '5.0'; 
};

DM.prototype.readfile= function (file1,csep,fs)
{
  var arrlines = [];
  var fileContents = fs.readFileSync(file1);
  var lines = fileContents.toString().split('\n');
   //começa em 1 ignora primeira linha de labels
  for (var i = 1; i < lines.length; i++) {
    arrlines.push(lines[i].toString().split(csep));
    
  }

  return arrlines;
}

DM.prototype.parseCSV= function (fileContents,csep,options)
{
   if(options==null)
   {
      options={skipHeaders:false};
   }
  var arrlines = [];
  var lines = fileContents.toString().split('\n');
   //começa em 1 ignora primeira linha de labels
   var ii=0;
   if(options.skipHeaders==true) 
      ii=1;
   
  for (var i = ii; i < lines.length; i++) {
    arrlines.push(lines[i].toString().split(csep));
  }

  return arrlines;
}

/* 
retorna column index, dado um nome de coluna 
*/
DM.prototype.ci= function (namesArray,colName)
{
  for(i=0;i<namesArray.length;i++)
    if(namesArray[i]==colName) return i;
  return -1;  
}


/** 
 * Gera matriz onde cada linha contem numseparadores e num de quotes do arquivo
 */
DM.prototype.getSeparatorTable= function (fileContents,options)
{
   if(options==null)
   {
      options= { columnSep:',',quoteChar:'"' };
   }
return dm_checkCSVFormat(fileContents,options.columnSep,options.quoteChar);
}

dm_checkCSVFormat= function (fileContents,csep,cquote)
{
  var arrlines = [];
  var lines = fileContents.toString().split('\n');
   //começa em 1 ignora primeira linha de labels
  var sline = [];
  sline.push('numsep'); 
  sline.push('numQuotes');
  //sline.push('numNewlines');
  arrlines.push(sline);
  
  for (var i = 0; i < lines.length; i++) {
	arrSep = lines[i].toString().split(csep);  
	arrQuotes = lines[i].toString().split(cquote);
	//arrNL = lines[i].toString().split('\n');
    var sline = [];
	sline.push(arrSep.length);
	sline.push(arrQuotes.length);
	//sline.push(arrNL.length);
	
    arrlines.push(sline);
  }

  return arrlines;
}

function replaceAll(str, find, replace) {
	  var i = str.indexOf(find);
	  if (i > -1){
	    str = str.replace(find, replace); 
	    i = i + replace.length;
	    var st2 = str.substring(i);
	    if(st2.indexOf(find) > -1){
	      str = str.substring(0,i) + replaceAll(st2, find, replace);
	    }       
	  }
	  return str;
	} 
/** 
 * Faz `escape`  de characteres dentro de quotes.
 * Funcionamento: 
 * este faz tratamento 'inside quote' e 'outside quote' 
 * quando inside, troca o separador  de coluna por "..."
 * retorna string
 * Objetivo: 
 * O parametro FIRST, indica de começa com quote ou não
 *OBS: o SPLIT retorna: Ex Input "Resource","TaskDate","TaskNAme","Hours"..
 * "       Resource",    "TaskDate    ",    "TaskNAme    ",    "Hours"
 * Fica:'', 'Resource',  ',',  'TaskDate',    ',',   'TaskName',   ',',    'Hours',
 *  '[CTBC]Levantamento', ',', '-', ',', '-', '\n',
 */
DM.prototype.escapeCSVsep= function (fileContents,csep,cquote,
options)
{
  var first=options.startInside;
  var s = '';
  //Quebra em 
  var pieces = fileContents.toString().split(cquote);
  //return pieces; //para teste
  
  var sline = [];
  //Nos dois casos abaixo, trata de 2 em 2 partes
  //tem o incremento do loop e um adicional
  for (var i = 0; i < pieces.length; i++) 
  {
    var sline1=[];	  
    if(first)
    {
    //considera primeiro que esta dentro de quote, e troca 
    //(ou faz escape) de separadores, new line e carriage return. 
       //s=s+'*par('+i+')';
               
       sline1 = pieces[i].toString();
    	//faz replace
        sliner = replaceAll(sline1,csep,'...');
        sliner = replaceAll(sliner,'\n','<nl>');
        sliner = replaceAll(sliner,'\r','<nr>');
        s=s+sliner;
    	i++;
    	if(i>=pieces.length)
    		break;
        //s=s+'*impar('+i+')'; 

    	sline1 = pieces[i].toString();
        s=s+sline1;
    }
    else
    {
       //s=s+'*par('+i+')';
       sline1 = pieces[i].toString();
       s=s+sline1;

       i++;
    	if(i>=pieces.length)
    		break;

       // s=s+'*impar('+i+')'; 
        //faz replace
        sliner = replaceAll(pieces[i],csep,'...');
        sliner = replaceAll(sliner,'\n','<nl>');
        sliner = replaceAll(sliner,'\r','<nl>');
        s=s+sliner;
    	
    }	
  }

  return s;
}



/*******************************************/
/*  obtem numero de colunas do arquivo... */
/*******************************************/
DM.prototype.readfileLine1= function (file1,csep,fs)
{
  var s = [];
  var fileContents = fs.readFileSync(file1);
  var lines = fileContents.toString().split('\n');


  return lines[0].toString().split(csep);
}

/*******************************************/
/* ultimas 10 linhas  */
/*******************************************/

DM.prototype.tail=function(mtx,options)
{
    plines=mtx.length;   
    var arrlines = [];
    if(plines<10)
    {
    for(i=0;i<plines;i++)
        arrlines.push(mtx[i]);
    }
    else
    {
       start=plines-10;
      for(i=0;i<plines;i++)
         if(i>start)
           arrlines.push(mtx[i]);
    }
     return arrlines;  
 }    

/*******************************************/
/* filtra 
arr_workhorasOK3=dm.filter(dm.noHeader(arr_workhorasOK3),opts,function(row,options){
    dt=row[dm.ci(cn,'DateNum')];
    return dt>20160000;
 Funcao de filtro: deve retorna true se inclui.   
 Trata mesmo se nao estiver com SORT
});
/*******************************************/
//DM.prototype.filterSorted=function(pmatrixfile,options,f)
DM.prototype.filter=function(pmatrixfile,options,f)
{
   var arrlines = [];
  for (var i = 0; i < pmatrixfile.length; i++) 
  {
      row=pmatrixfile[i];
      if(f(row,options)==true) 
         arrlines.push(row);
  }
  return arrlines;
}

DM.prototype.filterxxxxx=function(mtx,options)
{
    plines=mtx.length;   
    var arrlines = [];
    if(plines<10)
    {
    for(i=0;i<plines;i++)
        arrlines.push(mtx[i]);
    }
    else
    {
       start=plines-10;
      for(i=0;i<plines;i++)
         if(i>start)
           arrlines.push(mtx[i]);
    }
     return arrlines;  
 }    
/*
 groups by
*/
DM.prototype.groupBy=function(pmatrixfile,colIndex)
{
   var arrGroups = [];
   var arrLines = null;
   var prev=null;
  for (var i = 0; i < pmatrixfile.length; i++) 
  {
      row=pmatrixfile[i];
      colVal=row[colIndex];
      if(prev==null) // se é first
      {
         arrLines=[]; //novo grupo
         prev=colVal;
      }
      else
        if(prev!=colVal) // se é quebra
        {
           prev=colVal;
           arrGroups.push(arrLines);
           arrLines=[]; //novo grupo
        };
        
      arrLines.push(row);
  }
  arrGroups.push(arrLines);
  return arrGroups;
}

/*
 aggregateGroups
 //g=dm.groupBy([[1,123]]  ,0)
//g=dm.groupBy([[1,123],   [1,123],   [1,123]]  ,0)
//g=dm.groupBy([[1,123],   [1,123],   [1,123],   [3,123],  [3,123], [3,123],],0)
*/
DM.prototype.aggregateGroups=function(pGroups,colIndex,aggFuncType)
{
    pGroupsLen=pGroups.length;
    var agg = [];
    for(i=0;i<pGroupsLen;i++)
    {
       arrlines=pGroups[i];
       pLinesLen=arrlines.length;
       var row=null;
       var row1=null;// garda o primeiro registro. este vai para o grupo
       aggCount=0;
       aggSum=0;
       aggVal=0;
       aggMin=-999999999;
       aggMax=999999999
       for(j=0;j<pLinesLen;j++)
       {
           row=arrlines[j];
           if(j==0)
              row1=row;           
           aggCount++;
           aggSum+=parseInt(row[colIndex]);

           if(aggFuncType=='max')
            aggMax=aggVal>aggMax?aggVal:aggMax;
           if(aggFuncType=='min')
             aggMin=aggVal<aggMin?aggVal:aggMin;
       }
       if(aggFuncType=='count')
         aggVal=aggCount;
       if(aggFuncType=='sum')
         aggVal=aggSum;
       if(aggFuncType=='avg')
         aggVal=aggSum/aggCount;
       if(aggFuncType=='max')
         aggVal=aggMax;
       if(aggFuncType=='min')
         aggVal=aggMin;
         
       if(row1!=null)
       {
          row1[colIndex]=aggVal;
          agg.push(row1);           
       }  
     }     
    return agg;  
 }   

 function isNumber(o) {
    return typeof o == "number" || (typeof o == "object" && o.constructor === Number);
}
function isString(o) {
    return typeof o == "string" || (typeof o == "object" && o.constructor === String);
}
function xequal(a,b)
{
   if(isNumber(a))
     return a==b;
   else
      if(isString(a))
        return a.trim()===b.trim();
 }       
     
/***************************************************/
/* join: nao esta otimizado, varre sempre o array2  */
/***************************************************/
DM.prototype.join=function(mtx1,index1,mtx2,index2)
{
   var arrlines = [];
   var i,j,k;
  for (i = 0; i < mtx1.length; i++) 
  {
     row=mtx1[i];
     arrlines.push(row);
     lookval=row[index1];
     //console.log(row);
     found=false;
     //para cada registro da matriz 2
    for (j = 0; j < mtx2.length; j++) 
    {
     lookval2=mtx2[j][index2];
     //se encontrou...
     if(xequal(lookval,lookval2))
     {
        //loop de colunas, faz append de colunas
        s='';
        for(k=0;k<mtx2[j].length;k++)
        {
          arrlines[i].push(mtx2[j][k]);
          //s=s+','+mtx2[j][k];
         }
         //console.log('add:'+s);
         found=true;
         break;
     }
    }
    if(found==false)
    {
        //preenche vazio, usa como base a primeira linha da mtx2
        s='';
        for(k=0;k<mtx2[0].length;k++)
        {
          arrlines[i].push(0);
          //s=s+','+0;
         }
         //console.log('nadd:'+s);
     }

   } 
   //return {ii:i,jj:j,kk:k};
   return arrlines;  
} 
/*******************************************/
/* primeiras 10 linhas  */
/*******************************************/
DM.prototype.head=function(mtx,options)
{
    plines=mtx.length;
    max=(plines<10)?plines:10;
    var arrlines = [];
    
    for(i=0;i<max;i++)
       arrlines.push(mtx[i]);
     return arrlines;  
 }    

DM.prototype.noHeader=function(mtx)
{
    plines=mtx.length;
    var arrlines = [];
    for(i=1;i<plines;i++)
       arrlines.push(mtx[i]);
     return arrlines;  
 }    
DM.prototype.addHeader=function(mtx,header)
{
    plines=mtx.length;
    var arrlines = [];
    arrlines.push(header);
    for(i=1;i<plines;i++)
       arrlines.push(mtx[i]);
     return arrlines;  
 }    
 

DM.prototype.shape=function(mtx,options)
{
    plines=mtx.length;
    cols=0; if(plines>0) cols=mtx[0].length;
      
    return {rows:plines,cols:cols};
}

/* 
map: para transformacoes de valores de celulas
*/
DM.prototype.mapVector= function (v,fromArr,toArr)
{
  for(i=0;i<v.length;i++) 
    v[i]=DM_map(v[i],fromArr,toArr);

  return v;
}

/* 
map: para transformacoes de valores de celulas
*/
DM.prototype.mapCell= function (v,fromArr,toArr)
{
  return DM_map  (v,fromArr,toArr);
}
DM_map= function (v,fromArr,toArr)
{
  if(fromArr.length!=toArr.length)
    return -1;
  for(i=0;i<fromArr.length;i++)
    if(xequal(fromArr[i],v)) 
      return toArr[i];
    
  return null;  
}

/* 
map: para transformacoes de valores de celulas
*/
DM.prototype.map= function (v,fromArr,toArr)
{
  if(fromArr.length!=toArr.length)
    return -1;
  for(i=0;i<fromArr.length;i++)
    if(fromArr[i]==v) 
      return toArr[i];
    
  return null;  
}


/* 
Unique:gera valores unicos de uma coluna
*/
DM.prototype.unique= function (array,idCol)
{
  var dict_unique = {};
  var distinct = [];
  for( i=0;i<array.length;i++ )
  {
    v=array[i][idCol];
     if( typeof(dict_unique[v]) == "undefined"){
      distinct.push(v);
   }
   //adiciona ao dicionario... co valor nao importa
   dict_unique[v] = 0;
  }
  return distinct;
}
//NEXT: unique.
//filter
//sort

//agora é so 
//1)preparar um array com os headernames para usar em  dm.ci(names,'Data") (3 colunas)
//2)Fazer um loop que preencha a nova coluna com a data no formato em 3 colunas.
//3)Para filtrar, pode ser um loop tambpem...
//para fazer os mappings:
// fazer utilitario de unique, sort, join
// como tratar transformações? como em Pandas ?
//  combined['Sex'] = combined['Sex'].map({'male':1, 'female':0})
// sugestao => dm.map([['from','to'],['from','to'],['from','to']]);
// sugestao => dm.map2(fromArr, toArr);   => para casos onde o from é obtido com unique.
// faser getDummies



/*******************************************/
/*  seleciona partes de uma matriz */
/*  pmatrixfile = matriz */
/*  pnumparams ==> NAO UTILIZADO!!! */ 
/*  startrow, endrow+1 */
/*  startcol , passar endcol+1 
        
*/
/*******************************************/
DM.prototype.mget= function (pmatrixfile,pnumparams,startrow,endrow,startcol,endcol)
{
  return dm_xmget(pmatrixfile,startrow,endrow,startcol,endcol)
}

DM.prototype.mget2= function (pmatrixfile,startrow,endrow,startcol,endcol)
{
  return dm_xmget(pmatrixfile,startrow,endrow,startcol,endcol)
}
DM.prototype.cget= function (pmatrixfile,col)
{
  startrow=0;
  endrow=pmatrixfile.length;
  return dm_xmget(pmatrixfile,startrow,endrow,col,col+1)
}
DM.prototype.cgetVector= function (pmatrixfile,col)
{
  startrow=0;
  endrow=pmatrixfile.length;
  rm= dm_xmget(pmatrixfile,startrow,endrow,col,col+1);
  var rv=[];
  for(i=0;i<rm.length;i++)
    rv.push(rm[i][0]);
  return rv;
  
}

dm_xmget=function(pmatrixfile,startrow,endrow,startcol,endcol)
{
  var arrout = [];
  //console.log('MGET...startrown'+startrow+' endrow:'+endrow+' startcol:'+startcol+' endcol:'+endcol);
  for (var i = startrow; i < endrow; i++) 
  {
      //console.log('MGET line..');
      var arrcol=[];
      var s='';
      for (var j = startcol; j < endcol; j++) 
      {
         //console.log('MGET col..');
         arrcol.push(pmatrixfile[i][j]);
          if(j>0) s=s+(',');
          s=s+(pmatrixfile[i][j]);
      }
      //console.log(arrcol);
      //console.log(s);
      arrout.push(arrcol);
  }
  //console.log(arrout);
  return arrout;
}

/*
TransformROws:
.para cada linha, chama a funcçao f(), passando  ROW e parametro OPRTIONS
.Server para fazer transformações via funcao lambda.
.A funcao recebe row, deve modifica-la e retorna-la.
.O parametro options serve para passar um contexto arbitrario
*/
DM.prototype.transformRows=function(pmatrixfile,options,f)
{
  for (var i = 0; i < pmatrixfile.length; i++) 
  {
      row=pmatrixfile[i];
      pmatrixfile[i]=f(row,options);
  }
  return pmatrixfile;
}


/* ******************************************
 adiciona coluna no inicio de  uma matriz  com valor '1'
 na verdade, cada linha contem uma lista de células, cada uma pertence a uma coluna.
pmatrifules = array
pnumparams =  numero de colunas do array
addAtEnd = flag indicando que eh para adicionar a coluna no final
RETORNA: um novo array com mais uma coluna.
****************************************** */
DM.prototype.addcol=function(pmatrixfile,pnumparams, addAtEnd)
{
   return dm_addcol(pmatrixfile,pnumparams, addAtEnd);

}
DM.prototype.appendCol=function(pmatrixfile)
{
    plines=pmatrixfile.length;
    cols=0; if(plines>0) cols=pmatrixfile[0].length;
   return dm_addcol(pmatrixfile,cols, true);
}

dm_addcol=function(pmatrixfile,pnumparams, addAtEnd)
{
  var arrout = [];
  //console.log('xxxxxxxxxxxx\n MADD...');
  //startrown'+startrow+' endrow:'+endrow+' startcol:'+startcol+' endcol:'+endcol);
  for (var i = 0; i < pmatrixfile.length; i++) 
  {
      //console.log('MADD line..');
      var arrcol=[];
      var s='1,';
	  if(addAtEnd==false)
		arrcol.push(1);
      for (var j = 0; j < pnumparams; j++) 
      {
         //console.log('MADD col..');
         arrcol.push(pmatrixfile[i][j]);
          if(j>0) s=s+(',');
          s=s+pmatrixfile[i][j];
      }
	  if(addAtEnd==true)
		arrcol.push(1);
      //console.log(arrcol);
      //console.log(s);
      arrout.push(arrcol);
  }
  //console.log(arrout);
  return arrout;

}

/* ******************************************
HTML
***************************************** */
/* ******************************************
HTML
***************************************** */
/* ******************************************
HTML
***************************************** */
/* ******************************************
HTML
***************************************** */


/*******************************************/
/*  htmltable... */
/* plines: linhas */
/* pnumparams: colunas */
/*******************************************/
dm_htmltable=function(plines,pnumparams,mtx)
{
          var s="";
  //console.log('HTMLTABLE...plines:'+plines+' pnumparams:'+pnumparams);
          
          s=s+('<table border=1>');
          for(ii=0;ii<plines;ii++)
          {
              s=s+('<tr>');
              for(cc=0;cc<pnumparams;cc++)
              {
                s=s+('<td>');
                s=s+(mtx[ii][cc]);
                s=s+('</td>');
              }
              s=s+('</tr>');
          }
          s=s+('</table>');
          s=s+('<p>'+plines+' lines</p>');
          
          return s;
};

DM.prototype.htmltable=function(plines,pnumparams,mtx)
{
    return dm_htmltable(plines,pnumparams,mtx);
};

DM.prototype.htmltable=function(mtx)
{
    plines=mtx.length;
    cols=0;
    if(plines>0)
      cols=mtx[0].length;
      
    return dm_htmltable(plines,cols,mtx);
}
/* ******************************************
ESTATISTICA
****************************************** */
/* ******************************************
ESTATISTICA
****************************************** */
/* ******************************************
ESTATISTICA
****************************************** */
/* ******************************************
ESTATISTICA
****************************************** */

/* ******************************************
 multiplica duas matrizes
****************************************** */
DM.prototype.multiplyMatrices=function(m1, m2) {
    var result = [];
    for (var i = 0; i < m1.length; i++) {
        result[i] = [];
        for (var j = 0; j < m2[0].length; j++) {
            var sum = 0;
            for (var k = 0; k < m1[0].length; k++) {
                sum += m1[i][k] * m2[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}
/* ******************************************
 multiplica vetor por escalar
****************************************** */
DM.prototype.multiplyVector=function(m1,sc) {
    var result = [];
    for (var i = 0; i < m1.length; i++) {
        result[i] = m1[i]*sc;
    }
    return result;
}
/* ******************************************
 soma escalar em vetor 
****************************************** */
DM.prototype.sumToVector=function(m1,sc) {
    var result = [];
    for (var i = 0; i < m1.length; i++) {
        result[i] = m1[i]+sc;
    }
    return result;
}



/*******************************************/
//  Normaliza matriz
//  para cada coluna:
//         loop1: calcula média
//         loop2: calcula stddev (precisa da media)
//         loop3: subtrai da média e multiplica por stdev
/* plines: numero de linhas
 * pnumparams: num colunas 
 * pmtx: matrix 
 * retorna a matriz (pmtx é array, array em javascritpt é passado por copia
 * */
/*******************************************/
DM.prototype.normalizeMatrix=function(plines,pnumparams,pmtx, pDM)
{
    options={hasHeaders:false};
    dm_normalizeMatrix(plines,cols,pmtx,pDM,options,options);
}
DM.prototype.normalizeMatrix2=function(pmtx, pDM,options)
{
   if(options==null)
   {
      options={hasHeaders:false};
   }
    plines=pmtx.length;
    cols=0;
    if(plines>0)
      cols=pmtx[0].length;

    dm_normalizeMatrix(plines,cols,pmtx,pDM,options);
 }

dm_normalizeMatrix=function(plines,pnumparams,pmtx, pDM,options)
{
   if(options==null)
   {
      options={hasHeaders:false};
   }
   var ii=0;
   var nmtx=[];
   if(options.hasHeaders==true)
   {
      for(i=1;i<plines;i++)
        nmtx.push(pmtx[i]);
      pmtx=nmtx;
      plines--;
   }

   var s="";
		  var rmtx=[];
          //console.log('Normalize...plines:'+plines+' pnumparams:'+pnumparams);
          //loop de colunas
          var v=0;
          for(cc=0;cc<pnumparams;cc++)
          {
            //console.log('COL :'+cc+' ==========');
            v=0;
            //loop1 de linhas (calcula  media)
            var max1=-999999999;   // 999.999.999 = 999Milhoes
            var min1=+999999999;
            for(ii=0;ii<plines;ii++)
            {
                var c=parseFloat(pmtx[ii][cc]);
				//Faz contagem apenas de colunas numericas
				if(!isNaN(c))
					pDM.count[cc][0]=pDM.count[cc][0]+1;
                v+=c;
                if(c>max1) max1=c;
                if(c<min1) min1=c;
            }
            var v2=v/plines;
				
            pDM.gavg[cc][0]=v2;
            pDM.gmin[cc][0]=min1;
            pDM.gmax[cc][0]=max1;
            pDM.gstdev[cc][0]=0;
            //console.log('L0: SUM...:'+v+' max:'+max1+' min:'+min1);
            //console.log('L1: AVG...:'+DMgavg[cc][0]+' elemts:'+plines);

            v=0;
			vmad=0;
            //loop1 de linhas (calcula stdev) (calcula desvioPadrao da media)
            for(ii=0;ii<plines;ii++)
            {
                var c=parseFloat(pmtx[ii][cc]);
                v+= (c-pDM.gavg[cc][0])*(c-pDM.gavg[cc][0]);
				vmad+= Math.abs(c-pDM.gavg[cc][0]);
            }

            v=v/plines;
            pDM.gstdev[cc][0]= Math.sqrt(v);

            vmad=vmad/plines;
            pDM.gmad[cc][0]= vmad;

            //console.log('L2:  stdev:'+pDM.gstdev[cc][0]+' mean of n-mean:'+v);
            //console.log('L2:  vmad:'+pDM.gmad[cc][0]+' mean of n-mean:'+v);

           }; 
 
           //loop3: loop de linhas e colulas p/criar arraynew: normaliza  subtrai da média e multiplica por stdev
            for(ii=0;ii<plines;ii++)
            {
			  var lin1=[];
			  for(cc=0;cc<pnumparams;cc++)
			  {
                var c=parseFloat(pmtx[ii][cc]);
                //só normaliza se stdev != 0
                if(pDM.gstdev[cc][0]!=0)
                  c=(c-pDM.gavg[cc][0])/pDM.gstdev[cc][0];
                //else
                 // c=0;
				 lin1.push(c);
                 //rmtx[ii][cc]=c;
			   }
				rmtx.push(lin1);
            }

			return rmtx;
};

/*
 * Chama normalizeMAtrix, mas retorna a matriz desc ao inves da matriz normalizada
 */
DM.prototype.describe=function(pmtx,options)
{
   if(options==null)
   {
      options={hasHeaders:false};
   }

	var gDM = {
			count:[],
			gavg:[],
			gstdev:[],
			gmad:[],  //mean absolute deviatio
			gmax:[],
			gmin:[],
		} 
	
	//busca linhas e colunas automaticamente
	lins=pmtx.length;
	cols=0;
	if(lins>0)
		cols=pmtx[0].length;
	
    for(n=0;n<cols;n++)
    {
       //adiciona uma linha com uma coluna [1]
       gDM.count.push([0]);
       gDM.gavg.push([0]);
       gDM.gstdev.push([0]);
       gDM.gmin.push([0]);
       gDM.gmax.push([0]);
       gDM.gmad.push([0]);
    }
	
	if(cols>0)
		//this.normalizeMatrix(lins,cols,pmtx,gDM);
		this.normalizeMatrix2(pmtx,gDM,options);
	
	//transforma objeto gDM em tabela
	  DMstats=[];
	  
		  //emptyrow=[];emptyrow.push('label'); DMstats.push(emptyrow); 
		  emptyrow=[];emptyrow.push('count'); DMstats.push(emptyrow);
		  emptyrow=[];emptyrow.push('avg');  DMstats.push(emptyrow);
		  emptyrow=[];emptyrow.push('std');  DMstats.push(emptyrow);
		  emptyrow=[];emptyrow.push('mad');  DMstats.push(emptyrow);
		  emptyrow=[];emptyrow.push('min');  DMstats.push(emptyrow);
		  emptyrow=[];emptyrow.push('max');  DMstats.push(emptyrow);
	  
		  
	  //loop de colunas
	  for(var i=0;i<cols;i++)
	  {
	     //adiciona uma coluna em cada linha
		 linha=0;
		 //emptyrow=DMstats[linha++]; emptyrow.push(MXLabels[i]);
		 emptyrow=DMstats[linha++]; emptyrow.push(gDM.count[i]);
		 emptyrow=DMstats[linha++]; emptyrow.push(gDM.gavg[i]);
		 emptyrow=DMstats[linha++]; emptyrow.push(gDM.gstdev[i]);
		 emptyrow=DMstats[linha++]; emptyrow.push(gDM.gmad[i]);
		 emptyrow=DMstats[linha++]; emptyrow.push(gDM.gmin[i]);
		 emptyrow=DMstats[linha++]; emptyrow.push(gDM.gmax[i]);
	  }

	 
	return DMstats;
}

/*
 * graph
 */
DM.prototype.chart=function(pdataset,poptions)
{
  return SSCS_SimpleChart(pdataset,poptions)
}

/* ***********************************************80
Retorna texto html com grafico
pDataset: dataset de series
poptions: opcoes (se não passar, assume defaults
***************************************************  */
function  SSCS_SimpleChart(pdataset,poptions)
{
        if(poptions==null)
        {
            poptions=
            {
            title:'Chart',
            type:'bar',
            w:300,
            h_factor:0.5,
            x_labels:null,
            y_labels:null,
            axis_x:{text:'axis x',tick_step:10},
            axis_y:{text:'axis y',tick_step:10},
            };
        };
        
        
        //calcula tudo propocional a largura informada
        maxx=0;
        maxy=0;
        //pega primeira serie
        pdata=pdataset[0];
        if(poptions.type==='bar')
        {
           maxx=pdata.length;
           maxy=0;
           for(i=0;i<pdata.length;i++)
              maxy=(maxy>pdata[i])?maxy:pdata[i];
        }
        //implementar
        if(poptions.label_x==null)
        {
         //  for(i=0;i<
        }
        w=poptions.w;
        //calcula tudo propocional a largura informada
        stepx=w/maxx;
        stepy=(stepx*poptions.h_factor);
        //calcula tudo propocional a largura informada, X o fator
        h=maxy*stepy;
        xpad=150;
        ypad=5;
        xlabelAdd=15;
        ylabelSub=5;
        /*
        console.log('w:'+w);
        console.log('h:'+h);
        console.log('mx:'+maxx);
        console.log('my:'+maxy);
        console.log('sx:'+stepx);
        console.log('sy:'+stepy);
        */
        //Calcula altura total
        totalh=ypad+h+ypad+xlabelAdd+xlabelAdd;
        totalw=xpad+w+xpad;
 
        d_options= '"border:2px solid #EEEEEE;display: block;"';  
        t_options= '"display: block;"';  
        s_options= '';  
        s_options= '"height:'+totalh+'px; width:'+totalw+'px;"';  
         
        if(poptions.d_options)
             d_options= poptions.d_options;     

        if(poptions.t_options)
             t_options= poptions.t_options;     

        if(poptions.s_options)
             s_options= poptions.s_options;     

             if(poptions.h_override)
             totalh= parseInt(poptions.h_override);     
        
        style=SSC_getStyle(totalh,totalw);
        headertitle= '\
        <div style='+d_options+'  >\
        <table style='+d_options+' >\
        <p class=".label-title" align="center" >'+poptions.title+'</p>\
        <svg class="graph"  style='+s_options+' aria-labelledby="title desc"  >\
          <title id="title"  class=".label-title" >'+poptions.title+'</title>\
         ';

         //GRID X XXXXXXXXXXXXXXXXXXXXXX
         gridy= '<g class="grid y-grid" id="yGrid">\
          <line x1="'+xpad+'" x2="'+xpad+'" y1="'+ypad+'" y2="'+(ypad+h)+'"></line></g>';
        //GRID YYYYYYYYYYYYYYYYYYYYY
         gridx= '<g class="grid x-grid" id="xGrid">\
          <line x1="'+xpad+'" x2="'+(xpad+w)+'" y1="'+(ypad+h)+'" y2="'+(ypad+h)+'"></line></g>';
          //LABEL XXXXXXXXXXXXXXXXX
         labelx='';
         labelx= '<g class="labels x-labels">';
         for(i=0;i<maxx;i++)
          {
              if(i%poptions.axis_x.tick_step==0)
              {
                 if(poptions.x_labels)
                 {
                    if(i<poptions.x_labels.length)
                      si=poptions.x_labels[i];
                    else  
                      si=i;
                  }  
                 else              
                   si=i;
                 labelx=labelx+'<text x="'+(xpad+(stepx*i))+'" y="'+(ypad+h+xlabelAdd)+'">'+si+'</text>';
             }    
          }
         labelx=labelx+'<text x="'+(xpad*2)+'" y="'+(ypad+h+(xlabelAdd*2))+'" class="label-title">'+poptions.axis_x.text+'</text></g>';
          //LABEL YYYYYYYYYYYYYYY
         labely='';
         labely= '<g class="labels y-labels">';
         for(i=0;i<maxy;i++)
          {
              if(i%poptions.axis_y.tick_step==0)
              {
                 if(poptions.y_labels)
                 {
                    if(i<poptions.y_labels.length)
                      si=poptions.y_labels[i];
                    else  
                      si=i;
                 }     
                 else              
                   si=i;
                labely=labely+'<text x="'+(xpad-ylabelSub)+'" y="'+(h-(stepy*i))+'">'+si+'</text>';
              }  
          }
         labely=labely+'<text x="'+(xpad*0.80)+'" y="'+(h/2)+'" class="label-title">'+poptions.axis_y.text+'</text></g>';
          //DADOS **************************         
         var data=[];
         //scatter
         raio=4;
         //bar
         bar_w=stepx*0.80;
         
         data[0]= '<g class="data" data-setname="Our first data set">';
         for(i=0;i<maxx;i++)
         {
            bar_h=stepy*pdata[i];
            data[0]=data[0]+' <rect width="'+(bar_w)+'" height="'+(bar_h)+'"  x="'+(xpad+(stepx*i))+'" y="'+(h-bar_h)+'"></rect>';
         }   
          data[0]=data[0]+'</g>';
      //FOOTER =======================         
         footer= '\
        </svg>\
        </table>\
        </div>\
        ';
// FIM FIM FIM FIM FIM FIM FIM FIM FIM
          return style+
          headertitle+
          gridx+
          gridy+
         labelx+
         labely+
          data[0]+
          footer;
}


/* ******************************************************
Obtem style
******************************************************* */        
function SSC_getStyle(h,w)
{
// svg class graph
//    height: 100%;width: 100%;

        s= '\
        <style>\
        body {\
          font-family: "Open Sans", sans-serif;\
        }\
        .graph .labels.x-labels {\
          text-anchor: middle;\
        }\
        .graph .labels.y-labels {\
          text-anchor: end;\
        }\
        .graph {\
    height: '+h+'px;\
    width:  '+w+'px;\
        ';  
        s=s+
        '}\
        .graph .grid {\
          stroke: #ccc;\
          stroke-dasharray: 0;\
          stroke-width: 1;\
        }\
        .labels {\
          font-size: 13px;\
        }\
        .label-title {\
          font-weight: bold;\
          text-transform: uppercase;\
          font-size: 12px;\
          fill: black;\
        }\
        .data {\
          fill: red;\
          stroke-width: 1;\
        }/</style>';
        return s;
}


module.exports = new DM();


