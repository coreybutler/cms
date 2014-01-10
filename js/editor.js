/**
 * cms v0.0.0
 * Author: Corey Butler
 * Built on 01-10-2014
 * Copyright (c) 2014, Ecor Ventures, LLC. All Rights Reserved.
 * http://ecorventures.com
 */
function loginFinishedCallback(a){a?void 0==a.error?(toggleElement("signin-button"),gapi.client.load("plus","v1",function(){gapi.client.plus.people.get({userId:"me",access_type:"online"}).execute(function(a){profile=a,email=profile.emails.filter(function(a){return"account"===a.type})[0].value,load("http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js",function(){function a(a){return a.filter(function(a){return"account"==a.type})[0].value}$("body").on("focus","[contenteditable]",function(){var a=$(this);return a.data("before",a.html()),a}).on("blur keyup paste input","[contenteditable]",function(){var a=$(this);return a.data("before")!==a.html()&&(a.data("before",a.html()),a.trigger("change")),a}),$("#pagetitle").on("change",function(a){return editing?a.currentTarget.innerHTML!==editing.name.replace("."+editing.name.split(".")[editing.name.split(".").length-1],"")||ide.getSession().getValue()!==originaltext?(warnSave(),void 0):(warnSave(!1),void 0):(warnSave(),void 0)}),$("#pagetitle").on("blur",function(){isTitleDupe()&&(warnSave(!1),alert('A page with the name "'+$("#pagetitle")[0].innerHTML.trim()+'" already exists. Please choose another name.'),$("#pagetitle")[0].innerHTML=editing.name.replace(".md",""))}),$(".icon-floppy").click(function(a){$(a.currentTarget).hasClass("warn")&&saveFile()}),$(".icon-upload-cloud-outline").click(function(a){$(a.currentTarget).hasClass("warn")&&publishFile()}),$(".icon-logout").click(function(){window.location="https://accounts.google.com/Logout?service=profiles&continue=https://plus.google.com"}),$("#noticebar > a").click(function(a){a.preventDefault(),$("#noticebar").addClass("hide"),$("#noticebar > div")[0].innerHTML=""}),$.ajax({url:metaurl+"/static/admin/"+profile.id,dataType:"json",timeout:600,headers:{"x-site-id":profile.id,"x-site-email":a(profile.emails),"x-site-name":profile.displayName,"x-site-about":profile.aboutMe,"x-site-profileurl":profile.url},success:function(a,b){"success"==b&&($("div.icon-help").click(function(){toggleHelp()}),load("js/underscore.js",function(){load("js/github.js",function(){gh=new Github({token:a.token}),rct=(a.repos||[]).length,a.repos.forEach(function(a){var b=gh.getRepo(a.split("\\")[0],a.split("\\")[1]);b.read("gh-pages","CNAME",function(c,d){c||(prettyrepo[a]=d.trim()),b.contents("master","pages",function(b,c){JSON.parse(c).filter(function(a){return"file"==a.type&&"README.md"!==a.name&&".md"==a.name.substr(a.name.length-3,3).toLowerCase()}).forEach(function(b){files[a]=files[a]||{},files[a][b.path.replace(/\W/g,"")]={name:b.name,path:b.path,repo:a,sha:b.sha,id:b.path.replace(/\W/g,"")}}),rct--,0==rct&&populateFileTree()})})}),load("js/marked.js",function(){marked.setOptions({gfm:!0,tables:!0,pedantic:!1,sanitize:!1,smartLists:!0,smartypants:!0,langPrefix:"lang-"}),load("js/ace/ace.js",function(){ide=ace.edit("ide"),ide.getSession().setUseWrapMode(!0),ide.setShowPrintMargin(!1),ide.setBehavioursEnabled(!0),ide.setHighlightActiveLine(!1),ide.setFontSize(16),ide.renderer.setShowGutter(!1),ide.renderer.setAnimatedScroll(!0),ide.renderer.setHScrollBarAlwaysVisible(!1),ide.setTheme("ace/theme/chrome"),ide.getSession().setMode("ace/mode/markdown"),$("#ide").bind("keyup",function(){$("#preview > div")[0].innerHTML=marked(ide.getSession().getValue())}),ide.session.on("changeScrollTop",syncPreview),ide.session.selection.on("changeCursor",syncPreview),toggleElement("shell");var a=!1;$(document).keyup(function(a){77==a.keyCode&&a.ctrlKey}),$(document).keyup(function(b){if(b.ctrlKey)switch(b.keyCode){case 77:b.preventDefault(),a=!a,toggleHelp();break;case 16:b.preventDefault(),publishFile()}}),$(document).keydown(function(b){if(b.ctrlKey)switch(b.keyCode){case 77:b.preventDefault(),a||(a=!a,toggleHelp(!0));break;case 83:b.preventDefault(),saveFile()}}),$(".icon-folder-open-empty").hover(function(){$("#pages").removeClass("hide")}),$(document).mousemove(function(a){$("#pages").hasClass("hide")||$("#pages").width()+35<a.clientX&&$("#pages").addClass("hide")})})})})}))}})})})})):console.log("An error occurred"):console.log("Empty authResult")}function toggleElement(a){var b=document.getElementById(a);"hide"==b.getAttribute("class")?b.setAttribute("class","show"):b.setAttribute("class","hide")}function toggleHelp(a){if($){if(a=void 0!==a?a:!1)return $("div.helpmenu").removeClass("hide"),void 0;$("div.helpmenu").hasClass("hide")?$("div.helpmenu").removeClass("hide"):$("div.helpmenu").addClass("hide")}}function populateFileTree(){Object.keys(files).forEach(function(a){var b='<div id="'+a+'"><div class="hint--bounce hint--top hint--rounded" data-hint="New Page"><div class="icon-plus"></div></div><h2>'+(prettyrepo[a]||a.split("\\")[1])+"</h2>";Object.keys(files[a]).forEach(function(c){b=b+'<div><div id="'+c.replace("/","-")+'">'+files[a][c].name.replace(".md","").replace("markdown","")+'</div><div class="icon-cancel"></div></div>'}),b+="</div>",$("#pages").append(b),fileListeners()})}function fileListeners(){$("#pages > div > div > div:first-child").off("click").click(function(a){ide.off("change"),$(a.currentTarget).hasClass("icon-plus")?enableIDEListeners():openFile(a.currentTarget.parentNode.parentNode.id,a.currentTarget.id)}),$("#pages > div > div:nth-child(n+2) > div:last-child").off("click").click(function(a){confirm("Are you sure you want to delete "+a.currentTarget.parentNode.children[0].innerHTML+"?")&&deleteFile(a.currentTarget.parentNode.parentNode.id,a.currentTarget.parentNode.children[0].id)}),$("#pages > div:first-child > div > div.icon-plus").off("click").click(function(a){$("#pagetitle")[0].innerHTML="Untitled",ide.getSession().setValue("# Untitled"),$("#pagetitle")[0].setAttribute("contenteditable","true"),$(".idemask").addClass("hide"),$("#pages").addClass("hide"),warnSave(!1),newRepo=a.currentTarget.parentNode.parentNode.id,editing=void 0})}function getScrollHeight(a){return void 0!==a[0].scrollHeight?a[0].scrollHeight:void 0!==a.find("html")[0].scrollHeight&&0!==a.find("html")[0].scrollHeight?a.find("html")[0].scrollHeight:a.find("body")[0].scrollHeight}function syncPreview(){var a=$("#preview > div"),b=ide.getSession().getLength(),c=getScrollHeight(a),d=ide.getFirstVisibleRow()/b;a.scrollTop(d*c)}function warnSave(a){return(a=void 0!==a?a:!0)?($(".icon-floppy").addClass("warn"),void 0):($(".icon-floppy").removeClass("warn"),void 0)}function deleteFile(a,b){var c=files[a][b],d=gh.getRepo(a.split("\\")[0],a.split("\\")[1]);d.remove("master",c.path,c.sha,"Deleted by "+profile.name.givenName+" "+profile.name.familyName.substr(0,1).toUpperCase()+".",function(){$("#"+b).parent().remove(),void 0!==editing&&editing.id==b&&(editing=void 0,$(".idemask").removeClass("hide"),$("#pagetitle")[0].innerHTML="",ide.getSession().setValue(""),$("#preview > div")[0].innerHTML="",warnSave(!1),$(".icon-upload-cloud-outline").removeClass("warn")),delete files[a][b]})}function enableIDEListeners(){ide.on("change",function(){editing&&(ide.getSession().getValue()!==originaltext||$("#pagetitle")[0].innerHTML!==editing.name.replace("."+editing.name.split(".")[editing.name.split(".").length-1],"")?warnSave():warnSave(!1))})}function openFile(a,b){var c=files[a][b],d=a,a=gh.getRepo(a.split("\\")[0],a.split("\\")[1]),e="https://raw.github.com/"+d.replace(/\\/g,"/")+"/master/static.css";(void 0===editing||editing.repo!==d)&&(void 0!==editing&&$("head > link[ref=css-"+editing.repo.replace(/\\/g,"-")+"]").remove(),$("head").append('<link rel="stylesheet" ref="css-'+d.replace(/\\/g,"-")+'" href="'+e+'" type="text/css" />')),a.read("master",c.path,function(a,b){if(a)throw a;editing=c,originaltext=b,newRepo=void 0,$("#pages").addClass("hide"),ide.getSession().setValue(b),enableIDEListeners(),$("#pagetitle").off("keyup").on("keyup",function(a){if(13==a.keyCode){a.preventDefault();var b=$("#pagetitle")[0].innerHTML.replace(/(<([^>]+)>)/gi,"").trim();$("#pagetitle")[0].innerHTML=b,warnSave(b!==editing.name.trim()||ide.getSession().getValue()!==originaltext),$("#pagetitle").blur()}}),$("#preview > div")[0].innerHTML=marked(ide.getSession().getValue()),$("#pagetitle")[0].innerHTML=c.name.replace(".md",""),$("#pagetitle")[0].setAttribute("contenteditable","true"),$(".idemask").addClass("hide")})}function saveFile(){if($("#editor > .mask").focus(),$(".icon-floppy").hasClass("warn")){if("Untitled"==$("#pagetitle")[0].innerHTML)return alert("Please provide a title for the new document."),void 0;if($("#editor > .mask").removeClass("hide"),isTitleDupe())return warnSave(!1),alert('A page with the name "'+$("#pagetitle")[0].innerHTML.trim()+'" already exists. Please choose another name.'),$("#pagetitle")[0].innerHTML=editing.name.replace(".md",""),$("#editor > .mask").addClass("hide"),void 0;var a=gh.getRepo((newRepo||editing.repo).split("\\")[0],(newRepo||editing.repo).split("\\")[1]);a.write("master",void 0!==editing?editing.path.replace(editing.name,$("#pagetitle")[0].innerHTML.trim()+".md"):"pages/"+$("#pagetitle")[0].innerHTML.trim()+".md",ide.getSession().getValue(),"Updated by "+profile.name.givenName+" "+profile.name.familyName.substr(0,1).toUpperCase()+". via static administration system.",function(){a.getSha("master",void 0!==editing?editing.path.replace(editing.name,$("#pagetitle")[0].innerHTML.trim()+".md"):"pages/"+$("#pagetitle")[0].innerHTML.trim()+".md",function(b,c){if(void 0!==editing&&editing.name.replace(".md","")!==$("#pagetitle")[0].innerHTML)a.remove("master",editing.path,editing.sha,"Renamed to "+$("#pagetitle")[0].innerHTML,function(){var a=editing,b=editing.id,d=editing.path.replace(editing.name,$("#pagetitle")[0].innerHTML.trim()+".md"),e=d.replace(/\W/g,"");files[editing.repo][e]={id:e,name:$("#pagetitle")[0].innerHTML+".md",sha:c,path:d,repo:newRepo||editing.repo},editing=files[editing.repo][e],delete files[a.repo][b],$("#"+b)[0].innerHTML=editing.name.replace(".md",""),$("#"+b)[0].setAttribute("id",editing.id),$(".icon-upload-cloud-outline").hasClass("warn")||$(".icon-upload-cloud-outline").addClass("warn"),$(".icon-floppy").removeClass("warn"),$("#editor > .mask").addClass("hide")});else{if(void 0!==newRepo){var d="pages/"+$("#pagetitle")[0].innerHTML.trim()+".md",e=d.replace(/\W/g,"");files[newRepo][e]={id:e,name:$("#pagetitle")[0].innerHTML+".md",sha:c,path:d,repo:newRepo},editing=files[newRepo][e],$("#"+newRepo.replace("\\","\\\\")).append('<div><div id="'+e+'">'+files[newRepo][e].name.replace(".md","")+'</div><div class="icon-cancel"></div></div>'),fileListeners($("#"+newRepo.replace("\\","\\\\")+" > div")),originaltext="# Untitled"}$(".icon-upload-cloud-outline").hasClass("warn")||$(".icon-upload-cloud-outline").addClass("warn"),$(".icon-floppy").removeClass("warn"),$("#editor > .mask").addClass("hide")}newRepo=void 0})})}}function isTitleDupe(){return editing?Object.keys(files[editing.repo]).filter(function(a){return files[editing.repo][a].name.trim()==$("#pagetitle")[0].innerHTML.trim()+".md"&&editing.id!==files[editing.repo][a].id}).length>0:!1}function publishFile(){if($("#editor > .mask").focus(),(originaltext!=ide.getSession().getValue()||editing.name.replace(".md","")!=$("#pagetitle")[0].innerHTML)&&void 0!==editing){$("#editor > .mask").removeClass("hide");var a="https://raw.github.com/"+editing.repo.replace(/\\/g,"/")+"/master/static.css",b="<html>\n<head><title>"+editing.name.replace(".md","")+'</title><link rel="stylesheet" type="text/css" href="'+a+'"/></head>\n<body>\n'+$("#preview > div")[0].innerHTML.trim()+"\n</body>\n</html>";gh.getRepo(editing.repo.split("\\")[0],editing.repo.split("\\")[1]).write("gh-pages",editing.name.replace(".md","").replace(/\W|\s/g,"").trim().toLowerCase()+"/index.html",b,"Published by "+profile.name.givenName+" "+profile.name.familyName.substr(0,1).toUpperCase()+".",function(){$(".icon-upload-cloud-outline").removeClass("warn"),$("#editor > .mask").addClass("hide");var a=(1==prettyrepo.hasOwnProperty(editing.repo)?"http://"+prettyrepo[editing.repo]:"https://"+editing.repo.split("\\")[0]+".github.io/"+editing.repo.split("\\")[1])+"/"+editing.name.replace(".md","").replace(/\W|\s/g,"").trim().toLowerCase();$("#noticebar > div")[0].innerHTML='Available at <a href="'+a+'" target="_blank">'+a+"</a>.",$("#noticebar > div > a").click(function(){$("#noticebar").addClass("hide"),$("#noticebar > div")[0].innerHTML=""}),$("#ide").off("click").click(function(){$("#noticebar").addClass("hide"),$("#noticebar > div")[0].innerHTML=""}),$("#noticebar").removeClass("hide")})}}var metaurl="http://cmsapi.coreybutler.com",prettyrepo={},files={},profile,email,repo,newRepo,id,gh,editing,originaltext,load=function(a,b){var c,d=document.createElement("script");d.setAttribute("src",a),d.setAttribute("charset","utf-8"),d.setAttribute("type","text/javascript"),b&&(d.onreadystatechange=d.onload=function(){c||b(),c=!0}),document.getElementsByTagName("head")[0].appendChild(d)};