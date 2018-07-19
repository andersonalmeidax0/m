/*
V1: inicial
com treinamento funcionando (computeCost e dradient Descent)
com J sendo exibido em grafico.
V 1.1
mostra J e mostra os Thetas em grafico : OK funcionando
v1.2
TODO: predict
v1.3
Logistic Regression

v.1.5
-leitura do diretorio: OK
-calcula numparas com o numero de colunas do CSV (nao precisa passar params: ok
-mostra datatable de forma optional: ok
-mostra max e min: ok
-mostra labels dos dados ok
-grafico com tamanho proporcional (largura...) ok
		
-v 1.6 refactor e extract do codigo de "js-pandas" data manipulation		
-v 1.7 mudança de posicao de funcoes DM
-v 1.8 codigo mostrando labels 
- v1.9 refactor extract DM to class
- v1.95: precommit
-v2.0: funciona com dm 5.7, regressao linear, com normalizacao, regressao logistica (binaria, 1 ou 1) (nao tem oneVsAll). Nao tem mapping para polinomial, nao tem neural net linear nem logistica.
*/

var APPV="2.0"; 

//Ciclo: save, git add *, git diff --staged, git commit -m

var sys = require("sys");
var http = require("http");
var events = require("events");
var path = require("path");
var url = require("url");
var fs = require("fs");
var https = require('https');


sys.puts(APPV);


//var program_name = process.argv[0]; //value will be "node"
//var script_path = process.argv[1]; //value will be "yourscript.js"
//var arg1 = process.argv[2]; 
//var file1=arg1;
//var arg2 = process.argv[3]; 
//var cols=arg2;

/* *************************************************/
/* *************************************************/
/* UTIL    UTIL   UTIL                 */
/* *************************************************/
/* *************************************************/
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

function readDirFilesCSV()
{
	var xfiles=[];
	var xfiles2=[];
	xfiles=fs.readdirSync('.');
		for (var i=0; i<xfiles.length; i++) {
			if(xfiles[i].endsWith(".csv"))
			{
			  //console.log(xfiles[i]);
			  xfiles2[i]=xfiles[i];
			  //console.log(xfiles);
			} 
		}
	console.log('FILES2==============='+xfiles2);
	return xfiles2;
}


/* *************************************************/
/* *************************************************/
/* UTIL    UTIL   UTIL                 */
/* *************************************************/
/* *************************************************/

function toAsciiNoComma(src) {
    var ch, str, i, result = '';
    str = JSON.stringify(src);

    for (i = 1; i < str.length - 1; i++) {
        ch = str.charCodeAt(i);  
	  
        if (ch < 128) {
		    if(str.charAt(i) === ',')
              result += ' ';
			else	
              result += str.charAt(i);
        } else {
            result += '\\u' + ch.toString(16);
        }
    }
	return result;
}

/* *************************************************/
/* *************************************************/
/************************ MAIN ********************/
/************************ MAIN ********************/
/************************ MAIN ********************/
/* *************************************************/
/* *************************************************/
console.info('START2...');
var qs = require('querystring');

var dm = require('./dm');

var formParam1 = '<html><body>'
  + '<h1>Machine Learning Test Server: '+APPV+'</h1>'
  + '<form method="post" action="train" enctype="application/x-www-form-urlencoded"><fieldset>'
  + '<div><label for="colsep">File Column separator:</label>'
  +'<input type="text" id="colsep" name="colsep" value=","/></div>'
  + '<div><label for="file">file (CSV with 1st label line)(dont use \n on last line):</label>';

  var formParam2 = 
  // '<div><label for="numparam">numparam:</label><input type="text" id="numparam" name="numparam" value="2" /></div>'
  //+ '<div><label for="outputs">outputs:</label><input type="text" id="outputs" name="outputs" value="1"/></div>'
  '<hr>'
  + '<div><label for="mlmethod">mlmethod (0=linerReg,1=logReg):</label><input type="text" id="mlmethod" name="mlmethod" value="0" /></div>'
  + '<div><label for="alpha">alpha:</label><input type="text" id="alpha" name="alpha" value="0.01" /></div>'
  
  + '<div><label for="iterations">iterations:</label><input type="text" id="iterations" name="iterations" value="200" /></div>'
  + '<div><label for="p1">normalize:(subtrai da media e multiplica por stdev)</label><input type="text" id="p1" name="norm" value="0" /></div>'
  + '<hr>'
  + '<div><label for="p3">y scale (para J muito grande)(p3):</label><input type="text" id="p3" name="p3" value="1" /></div>'
  + '<hr>'
  + '<div><label for="batchlen">batchlen:</label><input type="text" id="batchlen" name="batchlen" value="1" /></div>'
  + '<div><label for="pauseon">pauseon:</label><input type="text" id="pauseon" name="pauseon" value="26" /></div>'
//  + '<div><label for="extra">graphscale (x):</label><input type="text" id="extra" name="extra" value="10" /></div>'
  + '<div><label for="iternum">iternum:</label><input type="text" id="iternum" name="iternum" value="0" /></div>'
//  + '<div><label for="p2">(p2)>graphscale (y):</label><input type="text" id="p2" name="p2" value="0.20" /></div>'
  + '<div><label for="showDataTable">showDataTable (X e Y)</label><input type="text" id="showDataTable" name="showDataTable" value="0" /></div>'
  + '<hr>'
  + '<div><input id="startTraining" type="submit" value="startTraining" /></div></fieldset></form>'
  + '</body></html>';
var serverPort = 8124;
var formDataInt = {
filename:"",
colsep:"",
numparam:0,
mlmethod:"",
alpha:0,
iterations:0,
batchlen:0,
pauseon:0,
extra:"",
norm:0,
p2:0,
p3:0,
showdataTable:0,
};
var matrixfile;
var MX;
var MY;
var TT;  //theta
var J;   //erro ou "cost"
var Jarr = []; //array de J para debug
var TTarr = []; //array de Theta

var gDM = {
	count:[],
	gavg:[],
	gstdev:[],
	gmad:[],  //mean absolute deviatio
	gmax:[],
	gmin:[],
	gsum:[],
} 

/*
var pDM.count=[];
var pDM.gavg=[];
var pDM.gstdev=[];
var pDM.gmad=[];  //mean absolute deviation
var pDM.gmax=[];
var pDM.gmin=[];
*/

/*
var pDM.count=[];
var pDM.gavg=[];
var pDM.gstdev=[];
var pDM.gmad=[];  //mean absolute deviation
var pDM.gmax=[];
var gDM.gmin=[];
*/

var MXLabels=[]; //array de labels de X


http.createServer(function (request, response) {
// GET GET GET GET GET GET GET GET
  if(request.method === "GET") {
    if (request.url === "/favicon.ico") {
      response.writeHead(404, {'Content-Type': 'text/html'});
      response.write('<!doctype html><html><head><title>404</title></head><body>404: Resource Not Found</body></html>');
      response.end();
    } 
    else 
    {
       if (request.url === "/param") 
       {
           UIParam(response);
       }
       else 
       {
         if (request.url === "/train") 
         {
            UITrain(response);          
         }
         else
         { 
           if (request.url === "/xxxxxx") 
           {
              //UIPredict(response);          
           }
           else
           {
              response.writeHead(404, 'Resource Not Found', {'Content-Type': 'text/html'});
              response.end('<!doctype html><html><head><title>404</title></head><body>404: Resource Not Found<hr>Try put "/param"</body></html>');
           }
          } 
       }  
    }
// POST POST POST POST POST POST POST POST 
  } else if(request.method === "POST") 
    {
      if (request.url === "/train" || request.url === "/predict") 
      {
        var requestBody = '';
        request.on('data', function(data) 
        {
          requestBody += data;
          if(requestBody.length > 1e7) 
          {
            response.writeHead(413, 'Request Entity Too Large', {'Content-Type': 'text/html'});
            response.end('<!doctype html><html><head><title>413</title></head><body>413: Request Entity Too Large</body></html>');
          }
        });
        request.on('end', function() 
        {  /* end: chegou no final do parsing do body do post */
            if (request.url === "/train" )
              UIPostTrainData(requestBody,response);
            else
               if (request.url === "/predict") 
                  UIPredict(requestBody,response);
        });
       } 
       else 
       {
        response.writeHead(404, 'Resource Not Found', {'Content-Type': 'text/html'});
        response.end('<!doctype html><html><head><title>404</title></head><body>404: Resource Not Found</body></html>');
       }
    } 
    else 
    {
    response.writeHead(405, 'Method Not Supported', {'Content-Type': 'text/html'});
    return response.end('<!doctype html><html><head><title>405</title></head><body>405: Method Not Supported</body></html>');
    }
}).listen(serverPort);

console.log('Server running at localhost:'+serverPort);
//process.exit(0);

/* *************************************************/
/* *************************************************/
/************************ FUNCTIONS   ********************/
/************************ FUNCTIONS   ********************/
/************************ FUNCTIONS   ********************/
/************************ FUNCTIONS   ********************/
/* *************************************************/
/* *************************************************/

/* *************************************************/
/* UI Para : mostra form de traindata 
   le os arquivos do diretorio para permitir selecao de arquivo*/
/* *************************************************/
function UIParam(response)
{

        response.writeHead(200, {'Content-Type': 'text/html'});
		
        response.write(formParam1);
 		var xitems=readDirFilesCSV();
		//console.log('XITEMs==================');
		console.log(xitems);
		//console.log('ENDXITEMs==================');
		
		response.write('<select name="filename" size="1">');
		for(var i=0;i<xitems.length;i++)
		{
		   response.write(' <option value="'+xitems[i]+'">'+xitems[i]+'</option>\n');
		   
		}
		response.write('</select>');
        response.write(formParam2);
        response.end('');
};

/* *************************************************/
/* UI PostTrainData : revebe dado do form */
/* *************************************************/
function UIPostTrainData(requestBody,response)
{
        var formData = qs.parse(requestBody);

        Jarr=[];
        TTarr=[];
        //console.log('POST TRAIN (v2)....');

          formDataInt.filename=formData.filename;
          formDataInt.colsep=formData.colsep;
          //formDataInt.numparam=formData.numparam;
          formDataInt.mlmethod=formData.mlmethod;
          formDataInt.alpha=formData.alpha;
          formDataInt.iterations=parseInt(formData.iterations);
          formDataInt.batchlen=formData.batchlen;
          formDataInt.pauseon=formData.pauseon;
          formDataInt.extra=formData.extra;
          formDataInt.iternum=parseInt(formData.iternum);
		  formDataInt.showDataTable=parseInt(formData.showDataTable);
	
          formDataInt.norm=formData.norm;
          formDataInt.p2=formData.p2;
          formDataInt.p3=formData.p3;
		  
          MXLabels=dm.readfileLine1(formDataInt.filename,formDataInt.colsep,fs);
		  formData.numparam=formDataInt.numparam=MXLabels.length;
		  
          matrixfile=dm.readfile(formDataInt.filename,formDataInt.colsep,fs);
		  /* mget PARAMS */ 
		  /*  pmatrixfile = matriz */
		  /* PNUMPARAMS - nao utilizado!!! */
		  /*  startrow, endrow+1 */
		  /*  startcol , passar endcol+1  */
      
//DM.prototype.mget= function (pmatrixfile,pnumparams,startrow,endrow,startcol,endcol)

          MY=dm.mget(matrixfile,  //file
      0,  //not userd    
		  0,  //startrow
		  parseInt(matrixfile.length), //endrow +1 
		  parseInt(formDataInt.numparam)-1,  //startcol (pega a ultima coluna)
		  parseInt(formDataInt.numparam)
		  );   //endcol+1
          
		  //Para graficos: calcula dados do Y
            v=0;
            //loop1 de linhas (calcula  media)
            var maxy=-999999999;   // 999.999.999 = 999Milhoes
            var miny=+999999999;
            for(ii=0;ii<MY.length;ii++)
            {
                var c=parseFloat(MY[ii][0]);
                v+=c;
                if(c>maxy) maxy=c;
                if(c<miny) miny=c;
            }
            var avgy=v/MY.length;

		  //escala o Y para casos de muito grande
          //que causaria um J muito grande (J é a soma das diferencas do real e predito)
          //MY=multiplyVector(MY,yscale);
          var yscale=parseFloat(formData.p3);
          for (var i = 0; i < MY.length; i++) {
              MY[i][0] = MY[i][0]*yscale;
          }

          //MX0 é a matriz sem a coluna Y
//DM.prototype.mget= function (pmatrixfile,pnumparams,startrow,endrow,startcol,endcol)

          var MX0=dm.mget(matrixfile,
      0, //not used    
		  0, //startrow
		  parseInt(matrixfile.length),  //endrow+1
		  0,  //startcol
		  parseInt(formDataInt.numparam)-1  //endcol +1  (exlcui Y que eh a ultima 
		  );
		  
		  //MX é a matriz com a coluna de 1´s  e sem coluna Y
          MX=dm.addcol(MX0,parseInt(formDataInt.numparam)-1,false);

		  //ATENCAO: chama 2 vezes esta rotina.
		  //PRIMEIRA VEZ CALCULA COM Y apenas para exibir na tela
		  //NA SEGUNDA VEZ calcula com MX, ou seja, com coluna 1 e sem Y
		  //calcula estatisticas 
          gDM.count=[];
          gDM.gavg=[];
          gDM.gstdev=[];
          gDM.gmad=[];
          gDM.gmin=[];
          gDM.gmax=[];
          gDM.gsum=[];
          for(n=0;n<parseInt(formDataInt.numparam);n++)
          {
             //adiciona uma linha com uma coluna [1]
             gDM.count.push([0]);
             gDM.gavg.push([0]);
             gDM.gstdev.push([0]);
             gDM.gmad.push([0]);
             gDM.gmin.push([0]);
             gDM.gmax.push([0]);
             gDM.gsum.push([0]);
          }
		  
		  //get statitstics
         //dm.normalizeMatrix(matrixfile.length,parseInt(formDataInt.numparam),matrixfile,gDM);
         dm.normalizeMatrix2(matrixfile,gDM);
		  
          response.writeHead(200, {'Content-Type': 'text/html'});
          response.write('<!doctype html><html><head><title>response</title>');
          //response.write('<meta http-equiv="refresh" content="10" />');
          response.write('</head>');
          var script1 = fs.readFileSync('script1.html');
          response.write(script1);
          //GRAPH:codigo para CRIAR init
		  
		  //Escala X[0]: 300/max. 300 é o tamanho em pixels do canvas
		  var canvsize=300;
		  xscale1=canvsize/(gDM.gmax[0]);
		  yscale1=canvsize/(maxy);
		  //subtrai valor menor  (soma se for negativo) para grafico comecar o primeiro valor em 0
		  //xstart=gmin[0]*-1;
		  //ystart=miny*-1;
		  xstart=0;
		  ystart=0;
		  
          response.write('<script>\n');
          response.write('var numpoints='+parseInt(MX0.length)+';\n');
          response.write('\ndadosx=['+dm.multiplyVector(dm.sumToVector(MX0,xstart),xscale1)+'];\n');
          response.write('\ndadosy=['+dm.multiplyVector(dm.sumToVector(MY,ystart),yscale1)+'];\n');
          //response.write('var dadosx=[10,20,30,40,50,60,70,80,90,100,110];\n');
          //response.write('var dadosy=[10,20,30,40,50,60,70,80,90,100,110];\n');
          response.write('var gcolor="#FF0000";\n');
          //response.write('var dadosx2=[14,26,34,47,52,60,73,80,90,100,110];\n');
          //response.write('var dadosy2=[20,30,40,50,60,72,80,90,100,110,100];\n');
          response.write('var gcolor2="#00FF00";\n');
          response.write('function init2()\n');
          response.write('{\n');
          response.write('  drawCanvas("myCanvas",numpoints,dadosx,dadosy,gcolor,300)\n');
          //response.write('  drawCanvas("myCanvas",numpoints,dadosx2,dadosy2,gcolor2,300)\n');
          response.write('}\n');
          response.write('</script>');
          
          //GRAPH:codigo para data init
          response.write('<body onload="init2()">');
          
          response.write('<h1>Training Parameters:</h1>');
          response.write('<h2><a href=\'train\'>click to train</a></h2>');
          
          response.write(' <xbr />filename: '+formData.filename);
          response.write(' <xbr />numparam: '+formData.numparam);

          response.write(' <xbr />mlmethod: '+(formData.mlmethod==0?'0=LinearReg':'1=LogisticRegresion'));
          response.write(' <xbr />alpha: '+formData.alpha);
          response.write(' <xbr />iterations: '+formData.iterations);
          response.write(' <xbr/>NORMALIZE?'+formDataInt.norm);
          response.write('<hr>');

          response.write(' <xbr />batchlen: '+formData.batchlen);
          response.write(' <xbr />pauseon: '+formData.pauseon);
          response.write(' <xbr />extra: '+formData.extra);
          response.write(' <xbr />extra: '+formData.p2);
          response.write(' <hr>');

          //Mostra 5 linhas dos dados

          //response.write('<hr>LABELS: '+MXLabels);
          response.write('<br/>DATA ARRAY - 5 primeiras linhas. Ultima coluna eh Y. TOTAL='+matrixfile.length);
          matrixfileWithLabels=[];
		  matrixfileWithLabels.push(MXLabels);
		  for(var i=0;i<matrixfile.length;i++) 
          matrixfileWithLabels.push(matrixfile[i]);
          
          //response.write('<hr>'+matrixfileWithLabels+'============'+matrixfileWithLabels.length);
          s = dm.htmltableOld(5,formDataInt.numparam,matrixfileWithLabels);
          response.write('<hr>'+s);
          /*
          //GRAPH:codigo para incluir canvas
          response.write('<table>');
          response.write('<tr><td>'+MXLabels[formDataInt.numparam-1]+':'+miny+' ate '+maxy+'</td>');
          response.write('<td><canvas id="myCanvas" width="'+canvsize+'" height="'+canvsize+'"');
          response.write('style="border:1px solid #d3d3d3;">');
          response.write('Your browser does not support the HTML5 canvas tag.</canvas>');
          response.write('</td></tr>');
          response.write('<tr><td></td><td>'+MXLabels[0]+':'+DMgmin[0]+' ate '+DMgmax[0]+'</td>');
          response.write('</tr>');
          response.write('</table>');
          */
          response.write('<hr>Statistcs<hr>');

		  //Loop de colunas
		  
		  //Prepara tabela de estatisticas como no Pandas.
		  //Cada coluna é uma coluna da tabela e cada linha uma informação estratística
		  //Adiciona linhas
		  DMstats=[];
		  
  		  emptyrow=[];emptyrow.push('label'); DMstats.push(emptyrow); 
  		  emptyrow=[];emptyrow.push('count'); DMstats.push(emptyrow);
  		  emptyrow=[];emptyrow.push('avg');  DMstats.push(emptyrow);
  		  emptyrow=[];emptyrow.push('std');  DMstats.push(emptyrow);
  		  emptyrow=[];emptyrow.push('mad');  DMstats.push(emptyrow);
  		  emptyrow=[];emptyrow.push('min');  DMstats.push(emptyrow);
  		  emptyrow=[];emptyrow.push('max');  DMstats.push(emptyrow);
  		  emptyrow=[];emptyrow.push('sum');  DMstats.push(emptyrow);
		  
		  //loop de colunas
		  for(var i=0;i<MXLabels.length;i++)
		  {
		     //adiciona uma coluna em cada linha
			 linha=0;
			 emptyrow=DMstats[linha++]; emptyrow.push(MXLabels[i]);
			 emptyrow=DMstats[linha++]; emptyrow.push(gDM.count[i]);
			 emptyrow=DMstats[linha++]; emptyrow.push(gDM.gavg[i]);
			 emptyrow=DMstats[linha++]; emptyrow.push(gDM.gstdev[i]);
			 emptyrow=DMstats[linha++]; emptyrow.push(gDM.gmad[i]);
			 emptyrow=DMstats[linha++]; emptyrow.push(gDM.gmin[i]);
			 emptyrow=DMstats[linha++]; emptyrow.push(gDM.gmax[i]);
			 emptyrow=DMstats[linha++]; emptyrow.push(gDM.gsum[i]);
		  }

		response.write('<br/>Descriptive Statistics:');
		s = dm.htmltableOld(DMstats.length,MXLabels.length+1,DMstats);
		response.write(s);
		/*  
 		response.write('<br/>MIN array:'+DMgmin);
		s = DMhtmltableOld(DMgmin.length,1,DMgmin);
		response.write(s);
		
 		response.write('<br/>MAX array:'+DMgmax);
		s = DMhtmltableOld(DMgmax.length,1,DMgmax);
		response.write(s);

		 response.write('<br/>AVG array:'+DMgavg);
		//response.write('<br/>AVG :'+gavg.length);
		s = DMhtmltableOld(DMgavg.length,1,DMgavg);
		response.write(s);

 		response.write('<br/>MAD (desvio absoluto da media) array:'+DMgmad);
		s = DMhtmltable(DMgmad.length,1,DMgmad);
		response.write(s);
		
		response.write('<br/>STDEV array:'+DMgstdev);
		//response.write('<br/>STDEV:'+gstdev.length);
		s = DMhtmltable(DMgstdev.length,1,DMgstdev);
		response.write(s);
		*/


		  //NA SEGUNDA VEZ calcula com MX, ou seja, com coluna 1 e sem Y
		  //calcula estatisticas 
		  gDM.count=[];
      gDM.gavg=[];
      gDM.gstdev=[];
		  gDM.gmad=[];
		  gDM.gmin=[];
		  gDM.gmax=[];
		  gDM.gsum=[];
          for(n=0;n<parseInt(formDataInt.numparam);n++)
          {
             //adiciona uma linha com uma coluna [1]
             gDM.count.push([0]);
             gDM.gavg.push([0]);
             gDM.gstdev.push([0]);
             gDM.gmad.push([0]);
             gDM.gmin.push([0]);
             gDM.gmax.push([0]);
             gDM.gsum.push([0]);
          }
  
  
          if(formDataInt.norm=='1')
          {
             response.write('<hr>Normalization Coefs: (added 1st colunm=1, last column (y) ommited)<hr>'+' '+'<br>');
			 //chama pela segunda vez agora guardando em MX.
             //MX=dm.normalizeMatrix(MX.length,parseInt(formDataInt.numparam),MX,gDM);
             //s = dm.htmltable(MX); response.write('<hr>'+s);
             MX=dm.normalizeMatrix2(MX,gDM);
             //s = dm.htmltable(MX); response.write('<hr>'+s);
             //response.write('<br/>X MATRIX lines NORM:'+MX.length);
             s = dm.htmltableOld(MX.length,parseInt(formDataInt.numparam),MX);
             response.write('<hr>'+s);
          };  

		  if(formDataInt.showDataTable==1)
		  {
			  response.write('<br/>X  lines:'+MX.length);
			  s = dm.htmltableOld(MX.length,parseInt(formDataInt.numparam),MX);
			  response.write('<hr>'+s);

				  
			  response.write('<br/>Y  lines:'+MY.length);
			  s = dm.htmltableOld(MY.length,1,MY);
			  response.write('<hr>'+s);
		  }
		  
		  
      //Inicializa THETA (com 2 parametros) (depois fazer "zeros" do octave)
      //TT = [ [0,0 ] ];
      
      TT = [];
      for(n=0;n<parseInt(formDataInt.numparam);n++)
      {
         TT.push([0]);
      }


         response.write('<hr>'+'FIM');       
         response.end('</body></html>');
}

/* *************************************************/
/* UI Train : trata treino - iteracao n */
/* *************************************************/
function UITrain(response)
{
          response.writeHead(200, {'Content-Type': 'text/html'});
          response.write('<!doctype html><html><head><title>response v2</title>');
          //para considerar iter=0 como primeira ou nao
          //it0=1;
          it0=0;
          //verifica se ja chegou na ultima iteracao
          
          if(formDataInt.iternum<=formDataInt.iterations-it0)
          {
            response.write('<meta http-equiv="refresh" content="0" />');
          }
          else
          {
            //no final para de dar refresh
          };

          response.write('</head>');

          if(formDataInt.iternum<=formDataInt.iterations-it0)
          {  
            response.write('<h1>Buscando parametros...</h1>\n');
          }
		      else
          {  
            response.write('<h1>Parametros encontrados.</h1>\n');
            response.write('<br />Erro entre real e previsto ANTERIOR (J): '+Jarr[formDataInt.iternum-3]);
            response.write('<br />Erro entre real e previsto ANTERIOR (J): '+Jarr[formDataInt.iternum-2]);
            response.write('<br />Erro entre real e previsto ANTERIOR (J): '+Jarr[formDataInt.iternum-1]);
            response.write('<br />Erro entre real e previsto ANTERIOR (J): '+Jarr[formDataInt.iternum]);
            response.write('<br />Iteration: '+parseInt(formDataInt.iternum));
          }

		  
          if(formDataInt.iternum<=formDataInt.iterations-it0)
          {  
            /////////////////////////////////////////////////
            // TREINA 1 ITERACAO
            /////////////////////////////////////////////////
            J = computeCost(parseInt(formDataInt.mlmethod),MX,MY,TT,response);
            response.write('<br />Iteration: '+parseInt(formDataInt.iternum));
            response.write('<br />Erro entre real e previsto (J): '+J);
            Jarr.push(J);

            TT = gradientDescent(parseInt(formDataInt.mlmethod),MX,MY,TT,formDataInt.alpha, response);
            TTarr.push(TT);
            console.log('===---------===>Cost(J)'+J+'  NEW TT:'+TT);
            
           }
          response.write('<br/>Coeficientes (Tethas) :');

          var CoefLabels=[];
          CoefLabels[0]='Intercept';
          for(var i=1;i<MXLabels.length;i++)
          {
              CoefLabels[i]=MXLabels[i-1];
          }
          TT2 = [];
          TT2.push(CoefLabels);
          TT2.push(TT);
          s = dm.htmltableOld(TT2.length,CoefLabels.length,TT2);
          response.write('<hr>'+s);
      

          //s = htmltableOld(TT.length,1,TT);
          //response.write('<hr>'+s);
          /////////////////////////////////////////////////
          // PREAPARA TELA
          /////////////////////////////////////////////////
          //var script1 = fs.readFileSync('script1.html');
          var script1=
          '<script>\n'+
          'var gcolor="#FF0000";\n'+
          'var gcolor2="#00FF00";\n'+
          'function drawCanvas(cname,pnumpoints,pdadosx,pdadosy,pgcolor,altura) \n'+
          '{\n'+
            'var c = document.getElementById(cname);\n'+
            'var ctx = c.getContext("2d");\n'+
            'ctx.fillStyle=pgcolor;\n'+
            'for(ii=0;ii<numpoints;ii++)\n'+
            '{\n'+
              'ctx.fillRect(pdadosx[ii],(altura/2)-pdadosy[ii],2,2);\n'+
            '}\n'+
            'ctx.stroke();\n'+
          '}\n'+
          '</script>\n';

          response.write(script1);
              
          var canvsize=180;

          response.write('<script>\n');

          //Inclui scripts que desenha graficos
          //Prepara variaveis dadosx e dadosy, dadosxN e dadosyN dos graficos
          response.write('var numpoints='+parseInt(formDataInt.iternum)+';\n');
          var dx=[];
          for(var i=0;i<formDataInt.iternum;i++)
             dx.push(i);
          
          //x=numero de iteracoes   
          //y=J (errors)

          //incluir script de dados para grafico de J (erro)
          //Escala X e Y 
          xscale1=canvsize/parseInt(formDataInt.iterations);
          //o maximo Y é o primeiro Erro x 10  (se o erro subir...)
          yscale1=canvsize/(Jarr[0]*10);
          response.write('\ndadosx=['+dm.multiplyVector(dx,xscale1)+'];\n');
          response.write('\ndadosy=['+dm.multiplyVector(Jarr,yscale1)+'];\n');
          response.write('var gcolorj="#0000FF";\n');
          
          
		  //incluir script de dados para grafico de coeficients
          //loop de thetas
          var maxtetha=[];
          for(var i=0;i<TT.length;i++)
          {
              response.write('var dadosx'+i+'=['+dm.multiplyVector(dx,xscale1)+'];\n');

                //escala o Y em theta.... vai mudando a escala do grafico de 100 em 100
                //busca o maior theta para escalar o grafico
              maxtetha.push(1000);
              for(var j=0;j<TTarr.length;j++)
              {
                 if(TTarr[j][i]>maxtetha)
                         maxtetha[i]=TTarr[j][i]+500;
              }		 
              yscale1=canvsize/(maxtetha[i]);
                //Pega a lista historica de thetas

             //DM.prototype.mget= function (pmatrixfile,pnumparams,startrow,endrow,startcol,endcol)
              var T1 = dm.mget2(TTarr, 0, TTarr.length,  i,i+1)
              response.write('var dadosy'+i+'=['+dm.multiplyVector(T1,yscale1)+'];\n');
              response.write('var gcolor'+i+'="#00FF00";\n');
          }

          //Inclui scripts que desenha graficos
          //response.write('var gcolor2="#00FF00";\n');
          response.write('function init2()\n');
          response.write('{\n');
          response.write('  drawCanvas("myCanvas",numpoints,dadosx,dadosy,gcolor,'+canvsize+');\n');
          //loop de thetas
          for(var i=0;i<TT.length;i++)
          {
              response.write('  drawCanvas("myCanvas'+i+'",numpoints,dadosx'+i+',dadosy'+i+',gcolor'+i+','+canvsize+');\n');
          }
          response.write('}\n');
          response.write('</script>\n');


          //GRAPH:codigo para data init
          response.write('<body onload="init2()">\n');

          if(formDataInt.iternum<=formDataInt.iterations-it0)
          {  
			      formDataInt.iternum++;
          }
          else
          {  //se terminou de treinar.....
            //Gera form para predict
            response.write('<h3>Parametros (coeficientes) encontrados.</h3>\n');

            var formParamPredict = '<form method="post" '
            +'action="predict" enctype="application/x-www-form-urlencoded">'
            +'<fieldset>\n';
            for(var i=0;i<TT.length;i++)
            {
              formParamPredict+='<div><label for="x'+i+'">'+CoefLabels[i]+':</label>';
              var val=1;
              var readonly='';
              if(i==0) 
              {
                 val=1; //se for intercept
               //readonly='disabled';
              }	 
              formParamPredict+='<input type="text" id="x'+i+'"  '+readonly+'  name="x'+i+'" value="'+val+'" /></div>\n';
            }
            formParamPredict+='<div><input id="startTraining" type="submit" value="Predict '+MXLabels[MXLabels.length-1]+'" /></div>\n';
            +'</fieldset>\n'
            +'</form>\n';
            response.write(formParamPredict);
            response.write('<br/>DATA ARRAY - 5 primeiras linhas. Ultima coluna eh Y. TOTAL='+matrixfile.length);
            matrixfileWithLabels=[];
            matrixfileWithLabels.push(MXLabels);
            for(var i=0;i<matrixfile.length;i++) 
               matrixfileWithLabels.push(matrixfile[i]);
//          response.write('<hr>'+matrixfileWithLabels+'============'+matrixfileWithLabels.length);
            s = dm.htmltableOld(5,formDataInt.numparam,matrixfileWithLabels);
            response.write('<hr>'+s);

          };

          //GRAPH:codigo para incluir canvas
          response.write('<table>\n');
          //J
          response.write('<tr>\n');
          response.write('<td>\n');

          response.write('<table>\n');
          response.write('<tr><td>Erro Real x Previsto(J):'+0+' ate '+Jarr[0]+'</td>');
          response.write('<td><canvas id="myCanvas" width="'+canvsize+'" height="'+canvsize+'"');
          response.write('style="border:1px solid #d3d3d3;">\n');
          response.write('Your browser does not support the HTML5 canvas tag.</canvas>\n');
          response.write('</td></tr>\n');
          response.write('<tr><td></td><td>Iteration:'+0+' ate '+formDataInt.iterations+'</td>');
          response.write('</tr>\n');
          response.write('</table>\n');
          response.write('</td>\n');

         
          //loop de thetas
          for(var i=0;i<TT.length;i++)
          {
            //response.write('  drawCanvas("myCanvas'+i+'",numpoints,dadosx'+i+',dadosy'+i+',gcolor,300)\n');
            response.write('<td>\n');

            response.write('<table>\n');

            if(i==0)
               response.write('<tr><td>Coeficiente "Intercept" : de '+ 0+' ate '+maxtetha[i]+'</td>');
            else   
              response.write('<tr><td>Coeficiente'+MXLabels[i-1]+': de '+ 0+' ate '+maxtetha[i]+'</td>');
              
            response.write('<td><canvas id="myCanvas'+i+'" width="'+canvsize+'" height="'+canvsize+'"\n');
            response.write('style="border:1px solid #d3d3d3;">\n');
            response.write('Your browser does not support the HTML5 canvas tag.</canvas>\n');
            response.write('</td></tr>\n');
            response.write('<tr><td></td><td>Iteration:'+0+' ate '+formDataInt.iterations+'</td>');
            response.write('</tr>\n');
            response.write('</table>\n');
            response.write('</td>\n');
          }

          response.write('</tr></table>\n');
          response.end('\n</body>\n</html>\n');
}

/* *************************************************/
/* UIPredict : faz Predição n */
/* *************************************************/
function UIPredict(requestBody,response)
{
        var formData = qs.parse(requestBody);
        var XX=[];
        var Xcols=[];
        for(var i=0;i<TT.length;i++)
        {
          console.log(formData['x'+i]);
          Xcols.push(formData['x'+i]);
        };
		//Xcols tem "N" linhas com os parametros
		//XX tem uma linha com os parametros, adicionando Xcols, este fica como colunas.
        //assim fica transposto...
        XX.push(Xcols);
        
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write('<!doctype html><html><head><title>response</title>');
        response.write('</head><body>');
        response.write('<h1>Predicao:</h1>');

		
		
          response.write('<br/>Input PARMS:'+XX.length);
		  var CoefLabels=[];
		  CoefLabels[0]='Intercept';
		  for(var i=1;i<MXLabels.length;i++)
		  {
		      CoefLabels[i]=MXLabels[i-1];
		  }
		  XX2 = [];
		  XX2.push(CoefLabels);
		  XX2.push(Xcols);
          s = dm.htmltableOld(XX2.length,CoefLabels.length,XX2);
          response.write('<hr>'+s);

          //s = DMhtmltableOld(1,XX[0].length,XX);
          //response.write('<hr>'+s);

          //Normaliza Dados fornecidos 
          response.write('<br/>Dados Normalizados:'+formDataInt.norm);
          if(formDataInt.norm=='1')
          {
			  response.write('<br/>Normalizacao: passo 1:subtrai da media (ficam em torno de x) ');
			  response.write('<br/>Normalizacao: passo 2:divide por stdev (escala valores) ');
			  response.write('<br/>AVG:'+gDM.gavg.length);
			  s = dm.htmltableOld(gDM.gavg.length,1,gDM.gavg);
			  response.write('<br/>STDEV:'+gDM.gstdev.length);
			  s = dm.htmltableOld(gDM.gstdev.length,1,gDM.gstdev);
            for(var i=1;i<TT.length;i++)
            {
               csep=XX[0][i];
               csep=csep-gDM.gavg[i];
               csep=csep/gDM.gstdev[i];
               XX[0][i]=csep;
            };
          }           
          response.write('<br/>Parametros Normalizados:'+XX.length);
		  XX2 = [];
		  XX2.push(CoefLabels);
		  XX2.push(Xcols);
          s = dm.htmltableOld(XX2.length,CoefLabels.length,XX2);
          response.write('<hr>'+s);

		  response.write('<br/>Coeficientes (Tethas) :');

		  var CoefLabels=[];
		  CoefLabels[0]='Intercept';
		  for(var i=1;i<MXLabels.length;i++)
		  {
		      CoefLabels[i]=MXLabels[i-1];
		  }
		  TT2 = [];
		  TT2.push(CoefLabels);
		  TT2.push(TT);
          s = dm.htmltableOld(TT2.length,CoefLabels.length,TT2);
          response.write('<hr>'+s);

		  
        //Faz a previsao!!!!!!!  
        //TT em linhas
        //XX em colunas (ja transposto)
        //ho=hipotese de theta
        var ho=dm.multiplyMatrices(XX,TT);
    
        //paramTable=MXLabels;
		//paramTable.push(XX);
		
        //  response.write('<br/>Parametros Normalizados:'+paramTable.length);
        //  s = DMhtmltableOld(MXLabels.length,2,MXLabels);
        //  response.write('<hr>'+s);
		
        response.write('<h1>Predict:'+MXLabels[MXLabels.length-1]+'='+ho+'</h1>');
        response.end('</body></html>');

}

/* *************************************************/
/* *************************************************/
/************************ MACHINE LEARN   ********************/
/************************ MACHINE LEARN   ********************/
/************************ MACHINE LEARN   ********************/
/************************ MACHINE LEARN   ********************/
/* *************************************************/
/* *************************************************/

/*******************************************/
/*  computecosst... */
// tp = tipo=0 regressao linear tp=1 regressao logistica
/*******************************************/
function computeCost(tp,pMX,pMY,pTT,response)
{
    var pJ=0;
/*
          response.write('<br/>Tetha (TT) MATRIX lines:'+pTT.length);
          s = htmltable(pTT.length,1,pTT);
          response.write('<hr>'+s);

          response.write('<br/>MX  MATRIX lines:'+pMX.length);
          s = htmltable(pMX.length,2,pMX);
          response.write('<hr>'+s);

          response.write('<br/>M_Y MATRIX lines:'+pMY.length);
          s = htmltable(pMY.length,1,pMY);
          response.write('<hr>'+s);
*/

    var m=pMY.length;  //numero de training examples
    //calcula h(x) [prediction]
    var ho=dm.multiplyMatrices(pMX,pTT);

    //Se for regressao logistica, ho tem ser o sigmoid function
    if(tp==1) {
      for(var i=0;i<m;i++)
      {
         ho[i]=sigmoid(ho[i]);
      }
    }  
    
/*  
      response.write('<br/>ho  MATRIX lines:'+ho.length);
      s = htmltable(ho.length,1,ho);
      response.write('<hr>'+s);
*/
    //Linear Regression
    //J= (sum( ho(X) - y)^2 ) ) / 2m
    //Logistic Regression
    //J= - (sum (-y*log(ho(x))+(1-y)*log(1-ho(x)))/m
    var soma=0;
    //faz SUM iterativo
    if(tp==0) //tp=0 regressao linear
    {
      for(var i=0;i<m;i++)
      {
         s1 = (ho[i]-pMY[i]);
         s2 = Math.pow(s1,2);
         //console.log('ho[i]:'+ho[i]+'pMY[i]:'+pMY[i]+'s1:'+s1+'s2:'+s2);
         soma += s2;
      }
     //console.log('===> SOMA'+soma)
      pJ=(1/(2*m)) * soma;
//      console.log('===##########################===> TT:'+pTT);
//      console.log('===##########################===> J:'+pJ);
    }
    else
    {   //tp=1 regressao log
      for(var i=0;i<m;i++)
      {
         yy=pMY[i];
         xho=ho[i];
         s1= (yy*Math.log(xho)) + ((1-yy)*Math.log(1-xho));
         //trata log(0) quando y=1
         if(yy==1)
           s1= (yy*Math.log(xho));
         
           
         //console.log('===> S1:'+s1+' i='+i+' yy='+yy+' ho='+xho+' ln:'+Math.log(xho));
         soma += s1;
         //if(isNaN(soma))
         //   exit(0);
      }
      //console.log('===> SOMA'+soma)
      pJ=-(1/(m)) * soma;
      //console.log('===> pJ'+pJ)
    
    }
    
    return pJ;
}

/*******************************************/
/*  gradient... */
/* Faz apenas uma iteração */
/*******************************************/
function gradientDescent(tp,pMX,pMY,pTT,alpha, response)
{

   var m=pMY.length;  //numero de training examples
   var nn= pMX[0].length; //pega o num de param da primeria linha

   //calcula h(x) [prediction]
   var ho=dm.multiplyMatrices(pMX,pTT);

   //tp=0 linearRegression, tp=1 logistiRegression
   //Para logistics, tem que calcular o sigmoid
    if(tp==1) {
      for(var i=0;i<m;i++)
      {
         ho[i]=sigmoid(ho[i]);
      }
    }  
    //Zera SIGMA:eh no novo tetha
    sigma = [];
    for(n=0;n<nn;n++)
    {
       sigma.push([0]);
    }

    //loop de parametros (features)   
    for(n=0;n<nn;n++)
    {
      //calcuma sum( (ho-y).* X(:,n) );
      var soma=0;
      //loop de todas as intancias de entrada
      //FOR abaixo:
      //Pagiana 3 de week 2
      //soma=sum(  (ho-y) * X )  
      var somaincr=0; //debug
      for(var i=0;i<m;i++)
      {
         s0 = (ho[i]-pMY[i]);
         s1 = s0* pMX[i][n];
         soma+=s1;
         somaincr+=s1;
//         console.log('!!!!!!!!!m:'+(i+1)+' somaincr'+somaincr+'!!jdev: '+s1);
      }
      s2=soma/m;
//      console.log('!!!!!!!!!!!!! soma: '+soma+' m:'+m+' soma/m:'+s2);
      //atualiza theta
      sigma[n][0]= pTT[n][0] - (alpha*s2);
//      console.log('new theta: '+sigma[n][0]);
   }
   return sigma;
 }




/* ******************************************
 ???????????????
****************************************** */
function NNgetX(pmatrixfile,pnumparams)
{
  var arrlines = [];
  var fileContents = fs.readFileSync(file1);
  var lines = fileContents.toString().split('\n');

  for (var i = 0; i < pmatrixfile.length; i++) {
    arrlines.push();
  }

  var s='';
  for (var i = 0; i < pmatrixfile.length-1; i++) {
      s='';
      for (var j = 0; j < cols; j++) {
          if(j>0) s=s+(',');
          s=s+(pmatrixfile[i][j]);
      }
      //s=s+'\n';
      //console.log(s);
  }
  return arrlines;
}


function sigmoid(t) {
    return 1/(1+Math.pow(Math.E, -t));
}

transpose = function(a) {

  // Calculate the width and height of the Array
  var w = a.length ? a.length : 0,
    h = a[0] instanceof Array ? a[0].length : 0;

  // In case it is a zero matrix, no transpose routine needed.
  if(h === 0 || w === 0) { return []; }

  /**
   * @var {Number} i Counter
   * @var {Number} j Counter
   * @var {Array} t Transposed data is stored in this array.
   */
  var i, j, t = [];

  // Loop through every item in the outer array (height)
  for(i=0; i<h; i++) {

    // Insert a new row (array)
    t[i] = [];

    // Loop through every item per item in outer array (width)
    for(j=0; j<w; j++) {

      // Save transposed data.
      t[i][j] = a[j][i];
    }
  }

  return t;
};

