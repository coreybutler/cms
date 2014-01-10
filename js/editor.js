var metaurl="http://localhost:8080",
		prettyrepo = {},
		files = {},
		profile, email, repo, newRepo, id, gh,  editing, originaltext;

var load = function(src, callback) {
	var script = document.createElement('script'),
			loaded;
	script.setAttribute('src', src);
	if (callback) {
		script.onreadystatechange = script.onload = function() {
			if (!loaded) {
				callback();
			}
			loaded = true;
		};
	}
	document.getElementsByTagName('head')[0].appendChild(script);
};

function loginFinishedCallback(authResult) {
	if (authResult) {
		if (authResult['error'] == undefined){
			toggleElement('signin-button');
			gapi.client.load('plus','v1', function(){
				gapi.client.plus.people.get({userId:'me',access_type:'online'}).execute(function(p) {
					profile = p;
					email = profile['emails'].filter(function(v) {
						return v.type === 'account';
					})[0].value;
					load('http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js',function(){
						$('body').on('focus', '[contenteditable]', function() {
							var $this = $(this);
							$this.data('before', $this.html());
							return $this;
						}).on('blur keyup paste input', '[contenteditable]', function() {
							var $this = $(this);
							if ($this.data('before') !== $this.html()) {
								$this.data('before', $this.html());
								$this.trigger('change');
							}
							return $this;
						});
						$('#pagetitle').on('change',function(e){
							if (!editing){
								warnSave();
								return;
							}
							if (e.currentTarget.innerHTML !== editing.name.replace('.'+editing.name.split('.')[editing.name.split('.').length-1],'') || ide.getSession().getValue() !== originaltext){
								warnSave();
								return;
							}
							warnSave(false);
						});
						$('#pagetitle').on('blur',function(e){
							if(isTitleDupe()){
								warnSave(false);
								alert('A page with the name \"'+$('#pagetitle')[0].innerHTML.trim()+'\" already exists. Please choose another name.');
								$('#pagetitle')[0].innerHTML=editing.name.replace('.md','');
							}
						});
						$('.icon-floppy').click(function(e){
							if (!$(e.currentTarget).hasClass('warn')){
								return;
							}
							saveFile();
						});
						$('.icon-upload-cloud-outline').click(function(e){
							if (!$(e.currentTarget).hasClass('warn')){
								return;
							}
							publishFile();
						});
						$('.icon-logout').click(function(e){
							window.location = 'https://accounts.google.com/Logout?service=profiles&continue=https://plus.google.com';
						});
						$('#noticebar > a').click(function(e){
							e.preventDefault();
							$('#noticebar').addClass('hide');
							$('#noticebar > div')[0].innerHTML = '';
						});
						function getEmail(e){
							return e.filter(function(eml){
								return eml.type == 'account';
							})[0].value;
						};
						$.ajax({
							url: metaurl+'/static/admin/'+profile.id,
							dataType:'json',
							timeout: 600,
							headers: {'x-site-id':profile.id,'x-site-email':getEmail(profile.emails),'x-site-name':profile.displayName,'x-site-about':profile.aboutMe,'x-site-profileurl':profile.url},
							success: function(data,status,xhr){
								if(status == 'success'){
									$('div.icon-help').click(function(e){
										toggleHelp();
									});
									load('js/underscore.js',function(){
										load('js/github.js',function(){
											gh = new Github({token:data.token}), rct = (data.repos||[]).length;
											
											data.repos.forEach(function(repository){
												var r = gh.getRepo(repository.split('\\')[0],repository.split('\\')[1]);
												r.read('gh-pages','CNAME',function(_err,_data){
													if (!_err) {
														prettyrepo[repository] = _data.trim();
													}
													r.contents('master','pages',function(err,f){
														JSON.parse(f).filter(function(el,i){
															return el.type == 'file' && el.name !== 'README.md' && el.name.substr(el.name.length-3,3).toLowerCase() == '.md';
														}).forEach(function(_file){
															files[repository] = files[repository] || {};
															files[repository][_file.path.replace(/\W/g, '')] = {
																name: _file.name,
																path: _file.path,
																repo: repository,
																sha: _file.sha,
																id: _file.path.replace(/\W/g, '')
															};
														});
														rct--;
														if (rct == 0){
															populateFileTree();
														}
													});
												});
											});
											
											load('js/marked.js',function(){
												marked.setOptions({
													gfm: true,
													tables: true,
													pedantic: false,
													sanitize: false,
													smartLists: true,
													smartypants: true,
													langPrefix: 'lang-'
												});
			
												load('js/ace/ace.js',function(){
													ide = ace.edit("ide");
													ide.getSession().setUseWrapMode(true);
													ide.setShowPrintMargin(false);
													ide.setBehavioursEnabled(true);
													ide.setHighlightActiveLine(false);
													ide.setFontSize(16);
													ide.renderer.setShowGutter(false); 
													ide.renderer.setAnimatedScroll(true);
													ide.renderer.setHScrollBarAlwaysVisible(false);
													ide.setTheme("ace/theme/chrome");
													ide.getSession().setMode("ace/mode/markdown");
													$('#ide').bind('keyup',function(){
														$('#preview > div')[0].innerHTML = marked(ide.getSession().getValue());
													});
													ide.session.on('changeScrollTop', syncPreview);
													ide.session.selection.on('changeCursor', syncPreview);
													toggleElement('shell');
													
													// Handle the help key shortcut
													var mdown = false;
													$(document).keyup(function(e){
														if (e.keyCode == 77 && e.ctrlKey){
															
														}
													});
													$(document).keyup(function(e){
														if (e.ctrlKey){
															switch(e.keyCode){
																case 77:
																	e.preventDefault();
																	mdown = !mdown;
																	toggleHelp();
																	break;
																case 16:
																	e.preventDefault();
																	publishFile();
																	break;
															}
														}
													});
													$(document).keydown(function(e){
														if (e.ctrlKey){
															switch(e.keyCode){
																case 77:
																	e.preventDefault();
																	if (!mdown){
																		mdown = !mdown;
																		toggleHelp(true);
																	}
																	break;
																case 83:
																	e.preventDefault();
																	saveFile();
																	break;
															}
														}
													});
													$('.icon-folder-open-empty').hover(function(){
														$('#pages').removeClass('hide');
													});
													$(document).mousemove(function(e){
														if (!$('#pages').hasClass('hide')){
															if ($('#pages').width()+35 < e.clientX){
																$('#pages').addClass('hide');
															}
														}
													});
												});
											});
										});
									});
								}
							}
						});
					});
				});
			});
		} else {
			console.log('An error occurred');
		}
	} else {
		console.log('Empty authResult');  // Something went wrong
	}
}

function toggleElement(id) {
	var el = document.getElementById(id);
	if (el.getAttribute('class') == 'hide') {
		el.setAttribute('class', 'show');
	} else {
		el.setAttribute('class', 'hide');
	}
}

function toggleHelp(forceOpen){
	if ($){
		forceOpen =forceOpen !== undefined ? forceOpen : false;
		if (forceOpen){
			$('div.helpmenu').removeClass('hide');
			return;
		}
		if ($('div.helpmenu').hasClass('hide')){
			$('div.helpmenu').removeClass('hide');
		} else {
			$('div.helpmenu').addClass('hide');
		}
	}
}

function populateFileTree(){
	Object.keys(files).forEach(function(repo){
		var str = '<div id="'+repo+'"><div class="hint--bounce hint--top hint--rounded" data-hint="New Page"><div class="icon-plus"></div></div>'
			+ '<h2>'+(prettyrepo[repo]||repo.split('\\')[1])+'</h2>';
		
		Object.keys(files[repo]).forEach(function(id){
			str = str + '<div><div id="'+id.replace('/','-')+'">'+files[repo][id].name.replace('.md','').replace('markdown','')+'</div><div class="icon-cancel"></div></div>';
		});
		str = str + '</div>';
		$('#pages').append(str);
		fileListeners();
	});
};

function fileListeners(parent){
	/*if (parent){
		parent.find('div:last-child').click(function(e){
			if (confirm('Are you sure you want to delete '+e.currentTarget.parentNode.children[0].innerHTML+'?')){
				deleteFile(e.currentTarget.parentNode.parentNode.id,e.currentTarget.parentNode.children[0].id);
			}
		});
	} else {*/
		$('#pages > div > div > div:first-child').off('click').click(function(e){
			ide.off('change');
			if (!$(e.currentTarget).hasClass('icon-plus')){
				openFile(e.currentTarget.parentNode.parentNode.id,e.currentTarget.id);
			} else {
				enableIDEListeners();
			}
		});
		$('#pages > div > div:nth-child(n+2) > div:last-child').off('click').click(function(e){
			if (confirm('Are you sure you want to delete '+e.currentTarget.parentNode.children[0].innerHTML+'?')){
				deleteFile(e.currentTarget.parentNode.parentNode.id,e.currentTarget.parentNode.children[0].id);
			}
		});
		$('#pages > div:first-child > div > div.icon-plus').off('click').click(function(e){
			$('#pagetitle')[0].innerHTML = 'Untitled';
			ide.getSession().setValue('# Untitled');
			$('#pagetitle')[0].setAttribute('contenteditable','true');
			$('.idemask').addClass('hide');
			$('#pages').addClass('hide');
			warnSave(false);
			newRepo = e.currentTarget.parentNode.parentNode.id;
			editing = undefined;
		});
	//}
};

/**
 * Get scrollHeight of preview div
 * (code adapted from https://github.com/anru/rsted/blob/master/static/scripts/editor.js)
 *
 * @param {Object} The jQuery object for the preview div
 * @return {Int} The scrollHeight of the preview area (in pixels)
 */
function getScrollHeight($prevFrame) {
	// Different browsers attach the scrollHeight of a document to different
	// elements, so handle that here.
	if ($prevFrame[0].scrollHeight !== undefined) {
			return $prevFrame[0].scrollHeight;
	} else if ($prevFrame.find('html')[0].scrollHeight !== undefined &&
						 $prevFrame.find('html')[0].scrollHeight !== 0) {
			return $prevFrame.find('html')[0].scrollHeight;
	} else {
			return $prevFrame.find('body')[0].scrollHeight;
	}
}

/**
 * Scroll preview to match cursor position in editor session
 * (code adapted from https://github.com/anru/rsted/blob/master/static/scripts/editor.js)
 *
 * @return {Void}
 */

function syncPreview() {
	var $prev = $('#preview > div'),
		editorScrollRange = (ide.getSession().getLength()),
		previewScrollRange = (getScrollHeight($prev));

	// means it is at the bottom).
	var scrollFactor = ide.getFirstVisibleRow() / editorScrollRange;

	// Set the scroll position of the preview pane to match.  jQuery will
	// gracefully handle out-of-bounds values.
	$prev.scrollTop(scrollFactor * previewScrollRange);
}

function warnSave(show){
	show = show !== undefined ? show : true;
	if(show){
		$('.icon-floppy').addClass('warn');
		return;
	}
	$('.icon-floppy').removeClass('warn');
}

function deleteFile(repo,id){
	var f = files[repo][id], repository = gh.getRepo(repo.split('\\')[0],repo.split('\\')[1]);
	repository.remove('master',f.path,f.sha,'Deleted by '+profile.name.givenName+' '+profile.name.familyName.substr(0,1).toUpperCase()+'.',function(err){
		$('#'+id).parent().remove();
		if (editing !== undefined && editing.id == id){
			editing = undefined;
			$('.idemask').removeClass('hide');
			$('#pagetitle')[0].innerHTML = '';
			ide.getSession().setValue('');
			$('#preview > div')[0].innerHTML = '';
			warnSave(false);
			$('.icon-upload-cloud-outline').removeClass('warn');
		}
		delete files[repo][id];
	});
};

function enableIDEListeners(){
	ide.on('change',function(e){
		if (editing){
			if (ide.getSession().getValue() !== originaltext || $('#pagetitle')[0].innerHTML !== editing.name.replace('.'+editing.name.split('.')[editing.name.split('.').length-1],'')){
				warnSave();
			} else {
				warnSave(false);
			}
		}
	});
};

function openFile(repo, id){
	var f = files[repo][id], r = repo;
	var repo = gh.getRepo(repo.split('\\')[0],repo.split('\\')[1]);
	var uri = "https://raw.github.com/"+r.replace(/\\/g,'/')+"/master/static.css"
	if(editing === undefined || editing.repo !== r){
		if (editing !== undefined){
			$('head > link[ref=css-'+editing.repo.replace(/\\/g,'-')+']').remove();
		}
		$('head').append('<link rel="stylesheet" ref="css-'+r.replace(/\\/g,'-')+'" href="'+uri+'" type="text/css" />');
	}
	repo.read('master',f.path,function(err,data){
		if (err) throw err;
		editing = f;
		originaltext = data;
		newRepo = undefined;
		$('#pages').addClass('hide');
		ide.getSession().setValue(data);
		enableIDEListeners();
		$('#pagetitle').off('keyup').on('keyup',function(e){
			if (e.keyCode == 13){
				e.preventDefault();
				var v = $('#pagetitle')[0].innerHTML.replace(/(<([^>]+)>)/ig,'').trim();
				$('#pagetitle')[0].innerHTML = v;
				warnSave(v !== editing.name.trim() || ide.getSession().getValue() !== originaltext);
				$('#pagetitle').blur();
			}
		});
		$('#preview > div')[0].innerHTML = marked(ide.getSession().getValue());
		$('#pagetitle')[0].innerHTML = f.name.replace('.md','');
		$('#pagetitle')[0].setAttribute('contenteditable','true');
		$('.idemask').addClass('hide');
	});
};

function saveFile() {
	$('#editor > .mask').focus();
	if (!$('.icon-floppy').hasClass('warn')){
		return;
	}
	if ($('#pagetitle')[0].innerHTML == 'Untitled'){
		alert("Please provide a title for the new document.");
		return;
	}
	$('#editor > .mask').removeClass('hide');
	// Prevent Dupes
	if (isTitleDupe()){
		warnSave(false);
		alert("A page with the name \""+$('#pagetitle')[0].innerHTML.trim()+"\" already exists. Please choose another name.");
		$('#pagetitle')[0].innerHTML = editing.name.replace('.md','');
		$('#editor > .mask').addClass('hide');
		return;
	}

	var r = gh.getRepo((newRepo||editing.repo).split('\\')[0],(newRepo||editing.repo).split('\\')[1]);
	
	r.write('master', (editing !== undefined ? editing.path.replace(editing.name,$('#pagetitle')[0].innerHTML.trim()+'.md') : 'pages/'+$('#pagetitle')[0].innerHTML.trim()+'.md'), ide.getSession().getValue(),'Updated by '+profile.name.givenName+' '+profile.name.familyName.substr(0,1).toUpperCase()+'. via static administration system.',function(err){
		r.getSha('master',(editing !== undefined ? editing.path.replace(editing.name,$('#pagetitle')[0].innerHTML.trim()+'.md'):'pages/'+$('#pagetitle')[0].innerHTML.trim()+'.md'),function(_e,sha){
			if (editing !== undefined && editing.name.replace('.md','') !== $('#pagetitle')[0].innerHTML){
				r.remove('master',editing.path,editing.sha,'Renamed to '+$('#pagetitle')[0].innerHTML,function(err){
					// Update the file data model
					var edt = editing, 
							oldId = editing.id,
							newPath = editing.path.replace(editing.name,$('#pagetitle')[0].innerHTML.trim()+'.md'), 
							newId = newPath.replace(/\W/g,'');
					
					files[editing.repo][newId] = {
						id: newId,
						name: $('#pagetitle')[0].innerHTML+'.md',
						sha: sha,
						path: newPath,
						repo: newRepo||editing.repo
					};

					editing = files[editing.repo][newId];
					delete files[edt.repo][oldId];
					
					// Rename the file in the view
					$('#'+oldId)[0].innerHTML = editing.name.replace('.md','');
					$('#'+oldId)[0].setAttribute('id',editing.id);
					
					if (!$('.icon-upload-cloud-outline').hasClass('warn')){
						$('.icon-upload-cloud-outline').addClass('warn'); 
					}
					$('.icon-floppy').removeClass('warn');
					$('#editor > .mask').addClass('hide');	
				});
			} else {
				if (newRepo !== undefined){
					var newPath = ('pages/'+$('#pagetitle')[0].innerHTML.trim()+'.md'), newId = newPath.replace(/\W/g,'')
					files[newRepo][newId] = {
						id: newId,
						name: $('#pagetitle')[0].innerHTML+'.md',
						sha: sha,
						path: newPath,
						repo: newRepo
					};
					editing = files[newRepo][newId];
					$('#'+newRepo.replace('\\','\\\\')).append('<div><div id="'+newId+'">'+files[newRepo][newId].name.replace('.md','')+'</div><div class="icon-cancel"></div></div>');
					fileListeners($('#'+newRepo.replace('\\','\\\\')+' > div'));
					originaltext = '# Untitled';
				}
				if (!$('.icon-upload-cloud-outline').hasClass('warn')){
					$('.icon-upload-cloud-outline').addClass('warn'); 
				}
				$('.icon-floppy').removeClass('warn');
				$('#editor > .mask').addClass('hide');
			}
			newRepo = undefined;
		});
	});
};

function isTitleDupe(){
	if (!editing){
		return false;
	}
	return (Object.keys(files[editing.repo]).filter(function(el,i){
		return files[editing.repo][el].name.trim() == $('#pagetitle')[0].innerHTML.trim()+'.md' && editing.id !== files[editing.repo][el].id;
	}).length > 0);
};

function publishFile() {
	$('#editor > .mask').focus();
	if ((originaltext == ide.getSession().getValue() && editing.name.replace('.md','') == $('#pagetitle')[0].innerHTML)||editing===undefined){
		return;
	}
	$('#editor > .mask').removeClass('hide');
	var css = "https://raw.github.com/"+editing.repo.replace(/\\/g,'/')+"/master/static.css";
	var html = '<html>\n<head><title>'+editing.name.replace('.md','')+'</title><link rel="stylesheet" type="text/css" href="'+css+'"/></head>\n<body>\n'
						+ $('#preview > div')[0].innerHTML.trim() + '\n</body>\n</html>';
	gh.getRepo(editing.repo.split('\\')[0],editing.repo.split('\\')[1]).write('gh-pages',editing.name.replace('.md','').replace(/\W|\s/g,'').trim().toLowerCase()+'/index.html', html, 'Published by '+profile.name.givenName+' '+profile.name.familyName.substr(0,1).toUpperCase()+'.', function(err){
		$('.icon-upload-cloud-outline').removeClass('warn');
		$('#editor > .mask').addClass('hide');
		var url = (prettyrepo.hasOwnProperty(editing.repo) == true
							? 'http://'+prettyrepo[editing.repo]
							: 'https://'+editing.repo.split('\\')[0]+'.github.io/'+editing.repo.split('\\')[1])
						+ '/' + editing.name.replace('.md','').replace(/\W|\s/g,'').trim().toLowerCase();
		$('#noticebar > div')[0].innerHTML = 'Available at <a href="'+url+'" target="_blank">'+url+'</a>.';
		$('#noticebar > div > a').click(function(e){
			$('#noticebar').addClass('hide');
			$('#noticebar > div')[0].innerHTML = '';
		});
		$('#ide').off('click').click(function(){
			$('#noticebar').addClass('hide');
			$('#noticebar > div')[0].innerHTML = '';
		});
		$('#noticebar').removeClass('hide');
	});
};