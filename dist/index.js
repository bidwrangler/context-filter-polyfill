!function(){"use strict";var t;!function(t){t.None="none",t.Url="url",t.Blur="blur",t.Brightness="brightness",t.Contrast="contrast",t.DropShadow="drop-shadow",t.Grayscale="grayscale",t.HueRotate="hue-rotate",t.Invert="invert",t.Opacity="opacity",t.Saturate="saturate",t.Sepia="sepia"}(t||(t={}));var a=new Map,r=function(t){var a=document.createElement("canvas");return a.height=t.canvas.height,a.width=t.canvas.width,Object.defineProperty(a,"__skipFilterPatch",{value:!0}),a.getContext("2d")};var e=["__skipFilterPatch","__currentPathMirror","canvas","filter","getImageData"];var n=["clearRect","drawImage","putImageData","fill","fillRect","fillText","stroke","strokeRect","strokeText"],i=function(t,r){r.match(/([-a-z]+)(?:\(([\w\d\s\.%-]*)\))?/gim).map(function(t){return t.match(/([-a-z]+)(?:\((.*)\))?/i).slice(1,3)}).reduce(function(t,r){var e=r[0],n=r[1];return a.has(e)?a.get(e).apply(void 0,[t].concat((n||"").split(" "))):t},t)},s=function(t){var a=parseFloat(t);return/%\s*?$/i.test(t)&&(a/=100),a},o=function(t){return parseFloat(t)};var c,h;a.set(t.None,function(t){return t}),a.set(t.Blur,function(t,a){void 0===a&&(a="0");var r=o(a);if(r<=0)return t;for(var e,n,i,s,c=t.canvas,h=c.height,u=c.width,v=t.getImageData(0,0,u,h),f=v.data,l=u-1,p=h-1,d=r+1,g=[1,57,41,21,203,34,97,73,227,91,149,62,105,45,39,137,241,107,3,173,39,71,65,238,219,101,187,87,81,151,141,133,249,117,221,209,197,187,177,169,5,153,73,139,133,127,243,233,223,107,103,99,191,23,177,171,165,159,77,149,9,139,135,131,253,245,119,231,224,109,211,103,25,195,189,23,45,175,171,83,81,79,155,151,147,9,141,137,67,131,129,251,123,30,235,115,113,221,217,53,13,51,50,49,193,189,185,91,179,175,43,169,83,163,5,79,155,19,75,147,145,143,35,69,17,67,33,65,255,251,247,243,239,59,29,229,113,111,219,27,213,105,207,51,201,199,49,193,191,47,93,183,181,179,11,87,43,85,167,165,163,161,159,157,155,77,19,75,37,73,145,143,141,35,138,137,135,67,33,131,129,255,63,250,247,61,121,239,237,117,29,229,227,225,111,55,109,216,213,211,209,207,205,203,201,199,197,195,193,48,190,47,93,185,183,181,179,178,176,175,173,171,85,21,167,165,41,163,161,5,79,157,78,154,153,19,75,149,74,147,73,144,143,71,141,140,139,137,17,135,134,133,66,131,65,129,1][r],_=[0,9,10,10,14,12,14,14,16,15,16,15,16,15,15,17,18,17,12,18,16,17,17,19,19,18,19,18,18,19,19,19,20,19,20,20,20,20,20,20,15,20,19,20,20,20,21,21,21,20,20,20,21,18,21,21,21,21,20,21,17,21,21,21,22,22,21,22,22,21,22,21,19,22,22,19,20,22,22,21,21,21,22,22,22,18,22,22,21,22,22,23,22,20,23,22,22,23,23,21,19,21,21,21,23,23,23,22,23,23,21,23,22,23,18,22,23,20,22,23,23,23,21,22,20,22,21,22,24,24,24,24,24,22,21,24,23,23,24,21,24,23,24,22,24,24,22,24,24,22,23,24,24,24,20,23,22,23,24,24,24,24,24,24,24,23,21,23,22,23,24,24,24,22,24,24,24,23,22,24,24,25,23,25,25,23,24,25,25,24,22,25,25,25,24,23,24,25,25,25,25,25,25,25,25,25,25,25,25,23,25,23,24,25,25,25,25,25,25,25,25,25,24,22,25,25,23,25,25,20,24,25,24,25,25,22,24,25,24,25,24,25,25,24,25,25,25,25,22,25,25,25,24,25,24,25,18][r],m=[],w=[],y=[],D=[],P=[],I=[],b=3;b-- >0;){for(var M=0,O=0,k=0;k<h;k++){for(var F=f[M]*d,C=f[M+1]*d,S=f[M+2]*d,x=f[M+3]*d,j=1;j<=r;j++)e=M+((j>l?l:j)<<2),F+=f[e++],C+=f[e++],S+=f[e++],x+=f[e];for(var R=0;R<u;R++)m[O]=F,w[O]=C,y[O]=S,D[O]=x,0===k&&(P[R]=((e=R+d)<l?e:l)<<2,I[R]=(e=R-r)>0?e<<2:0),n=M+P[R],i=M+I[R],F+=f[n++]-f[i++],C+=f[n++]-f[i++],S+=f[n++]-f[i++],x+=f[n]-f[i],O++;M+=u<<2}for(R=0;R<u;R++){var T=R;for(F=m[T]*d,C=w[T]*d,S=y[T]*d,x=D[T]*d,j=1;j<=r;j++)F+=m[T+=j>p?0:u],C+=w[T],S+=y[T],x+=D[T];for(O=R<<2,k=0;k<h;k++)f[O+3]=s=x*g>>>_,s>0?(s=255/s,f[O]=(F*g>>>_)*s,f[O+1]=(C*g>>>_)*s,f[O+2]=(S*g>>>_)*s):f[O]=f[O+1]=f[O+2]=0,0===R&&(P[k]=((e=k+d)<p?e:p)*u,I[k]=(e=k-r)>0?e*u:0),n=R+P[k],i=R+I[k],F+=m[n]-m[i],C+=w[n]-w[i],S+=y[n]-y[i],x+=D[n]-D[i],O+=u<<2}}return t.putImageData(v,0,0),t}),a.set(t.Brightness,function(t,a){if(void 0===a&&(a="1"),1===(a=s(a)))return t;a<0&&(a=0);for(var r=t.canvas,e=r.height,n=r.width,i=t.getImageData(0,0,n,e),o=i.data,c=o.length,h=0;h<c;h+=4)o[h+0]*=a,o[h+1]*=a,o[h+2]*=a;return t.putImageData(i,0,0),t}),a.set(t.Contrast,function(t,a){if(void 0===a&&(a="1"),1===(a=s(a)))return t;a<0&&(a=0);for(var r=t.canvas,e=r.height,n=r.width,i=t.getImageData(0,0,n,e),o=i.data,c=o.length,h=0;h<c;h+=4)o[h+0]=255*((o[h+0]/255-.5)*a+.5),o[h+1]=255*((o[h+1]/255-.5)*a+.5),o[h+2]=255*((o[h+2]/255-.5)*a+.5);return t.putImageData(i,0,0),t}),a.set(t.DropShadow,function(t,a,r,e,n){var i=document.createElement("canvas").getContext("2d");i.canvas.width=t.canvas.width,i.canvas.height=t.canvas.height,i.shadowOffsetX=o(a),i.shadowOffsetY=o(r),i.shadowBlur=n?o(e||"0"):0,i.shadowColor=n||e||"transparent",i.drawImage(t.canvas,0,0);var s=t.canvas,c=s.width,h=s.height;return t.putImageData(i.getImageData(0,0,c,h),0,0),t}),a.set(t.Grayscale,function(t,a){if(void 0===a&&(a="0"),(a=s(a))<=0)return t;a>1&&(a=1);for(var r=t.canvas,e=r.height,n=r.width,i=t.getImageData(0,0,n,e),o=i.data,c=o.length,h=0;h<c;h+=4){var u=.2126*o[h]+.7152*o[h+1]+.0722*o[h+2];o[h+0]+=(u-o[h+0])*a,o[h+1]+=(u-o[h+1])*a,o[h+2]+=(u-o[h+2])*a}return t.putImageData(i,0,0),t}),a.set(t.HueRotate,function(t,a){void 0===a&&(a="0deg");var r=function(t){var a=parseFloat(t);switch(t.slice(a.toString().length)){case"deg":a/=360;break;case"grad":a/=400;break;case"rad":a/=2*Math.PI}return a}(a);if(r<=0)return t;var e,n,i,s,o,c,h,u,v,f=t.canvas,l=f.height,p=f.width,d=t.getImageData(0,0,p,l),g=d.data,_=(r%1+1)%1*3,m=Math.floor(_),w=_-m,y=1-w;switch(m){case 0:e=y,n=0,i=w,s=w,o=y,c=0,h=0,u=w,v=y;break;case 1:e=0,n=w,i=y,s=y,o=0,c=w,h=w,u=y,v=0;break;case 2:e=w,n=y,i=0,s=0,o=w,c=y,h=y,u=0,v=w}for(var D=0,P=0;P<l;++P)for(var I=0;I<p;++I){var b=g[0+(D=4*(P*p+I))],M=g[D+1],O=g[D+2];g[D+0]=Math.floor(e*b+n*M+i*O),g[D+1]=Math.floor(s*b+o*M+c*O),g[D+2]=Math.floor(h*b+u*M+v*O)}return t.putImageData(d,0,0),t}),a.set(t.Invert,function(t,a){if(void 0===a&&(a="0"),(a=s(a))<=0)return t;a>1&&(a=1);for(var r=t.canvas,e=r.height,n=r.width,i=t.getImageData(0,0,n,e),o=i.data,c=o.length,h=0;h<c;h+=4)o[h+0]=Math.abs(o[h+0]-255*a),o[h+1]=Math.abs(o[h+1]-255*a),o[h+2]=Math.abs(o[h+2]-255*a);return t.putImageData(i,0,0),t}),a.set(t.Opacity,function(t,a){if(void 0===a&&(a="1"),(a=s(a))<0)return t;a>1&&(a=1);for(var r=t.canvas,e=r.height,n=r.width,i=t.getImageData(0,0,n,e),o=i.data,c=o.length,h=3;h<c;h+=4)o[h]*=a;return t.putImageData(i,0,0),t}),a.set(t.Saturate,function(t,a){void 0===a&&(a="1");var r=s(a);if(1===r)return t;r<0&&(r=0);for(var e=t.canvas,n=e.height,i=e.width,o=t.getImageData(0,0,i,n),c=o.data,h=.3086*(1-r),u=.6094*(1-r),v=.082*(1-r),f=i<<2,l=0;l<n;l++)for(var p=l*f,d=0;d<i;d++){var g=p+(d<<2),_=c[g+0],m=c[g+1],w=c[g+2];c[g+0]=(h+r)*_+u*m+v*w,c[g+1]=h*_+(u+r)*m+v*w,c[g+2]=h*_+u*m+(v+r)*w}return t.putImageData(o,0,0),t}),a.set(t.Sepia,function(t,a){if(void 0===a&&(a="0"),(a=s(a))<=0)return t;a>1&&(a=1);for(var r=t.canvas,e=r.height,n=r.width,i=t.getImageData(0,0,n,e),o=i.data,c=o.length,h=0;h<c;h+=4){var u=o[h+0],v=o[h+1],f=o[h+2];o[h+0]=(.393*u+.769*v+.189*f)*a+u*(1-a),o[h+1]=(.349*u+.686*v+.168*f)*a+v*(1-a),o[h+2]=(.272*u+.534*v+.131*f)*a+f*(1-a)}return t.putImageData(i,0,0),t}),"filter"in CanvasRenderingContext2D.prototype||(c=HTMLCanvasElement,h=CanvasRenderingContext2D,Object.defineProperty(c.prototype,"__skipFilterPatch",{writable:!0,value:!1}),Object.defineProperty(c.prototype,"__currentPathMirror",{writable:!0,value:void 0}),Object.defineProperty(h.prototype,"filter",{writable:!0,value:t.None}),function(t){Object.keys(t.prototype).filter(function(t){return e.indexOf(t)<0}).map(function(a){return{member:a,descriptor:Object.getOwnPropertyDescriptor(t.prototype,a)}}).filter(function(t){return t.descriptor.set}).forEach(function(a){var e=a.member,n=a.descriptor;Object.defineProperty(t.prototype,e,{get:function(){return this.canvas.__skipFilterPatch?n.get.call(this):this.canvas.__currentPathMirror[e]},set:function(t){if(this.canvas.__skipFilterPatch)return n.set.call(this,t);this.canvas.__currentPathMirror||(this.canvas.__currentPathMirror=r(this)),this.canvas.__currentPathMirror[e]=t}})})}(CanvasRenderingContext2D),function(t){Object.keys(t.prototype).filter(function(t){return e.indexOf(t)<0}).map(function(a){return{member:a,descriptor:Object.getOwnPropertyDescriptor(t.prototype,a)}}).filter(function(t){var a=t.descriptor;return a.value&&"function"==typeof a.value}).forEach(function(a){var e=a.member,s=a.descriptor.value;Object.defineProperty(t.prototype,e,{value:function(){for(var t,a=[],o=0;o<arguments.length;o++)a[o]=arguments[o];if("save"===e)return this.__savedFilterStates||(this.__savedFilterStates=[]),this.__savedFilterStates.push(this.filter),s.call.apply(s,[this].concat(a));if("restore"===e)return this.__savedFilterStates&&this.__savedFilterStates.length&&(this.filter=this.__savedFilterStates.pop()),s.call.apply(s,[this].concat(a));if(this.canvas.__skipFilterPatch||"clearRect"===e)return s.call.apply(s,[this].concat(a));this.canvas.__currentPathMirror||(this.canvas.__currentPathMirror=r(this));var c=(t=this.canvas.__currentPathMirror)[e].apply(t,a);if(n.indexOf(e)>-1){i(this.canvas.__currentPathMirror,this.filter),this.canvas.__skipFilterPatch=!0;var h=void 0;"getTransform"in this&&(h=this.getTransform(),this.setTransform(1,0,0,1,0,0)),this.drawImage(this.canvas.__currentPathMirror.canvas,0,0),h&&this.setTransform(h),this.canvas.__skipFilterPatch=!1,this.canvas.__currentPathMirror=r(this)}return c}})})}(CanvasRenderingContext2D))}();