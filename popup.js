const button = '<button class="close" type="button" title="Remove this page">×</button>';
const edit = '<button class="edit" type="button" title="Edit tab Name">✎</button>';
jQuery.fn.exists = function(){ return this.length > 0; }

function print(msg){
    $("#hello-section").text(msg)
}

function addItem(addButton, URL ,Title, currentTabID){
    let storageObject = []
    if (!currentTabID) {
        currentTabID = addButton.parent().attr('id')
    }
        let currentTabHref = "#" + currentTabID
        let span_elem = $('a[href="' + currentTabHref + '"]').children('span').eq(0)
        let currentTabName = span_elem.text()
            chrome.storage.local.get('storage', function(storage){
                if (storage.storage){
                    storageObject = Array.from(storage.storage)
                    let unique_url_number = storageObject.length
                    storageObject.push([URL, Title, currentTabName, currentTabID, unique_url_number, true])
                }
                else{
                    storageObject = [[URL, Title, currentTabName, currentTabID, 0, true]]
                }
                set({"storage": storageObject})
                set({"current": currentTabID})
            })
    location.reload()
}


function displayURLsv2() {
    chrome.storage.local.get('storage', function(storage) {
        if (storage.storage) {
            let arr = Array.from(storage.storage)
            arr.forEach(function(item, index){
                if (item[5]) {
                    let tabDiv = $("#" + item[3])
                    if (!(tabDiv).exists()) {
                        $('#tab-list').append($('<li><a href="#' + item[3] + '" role="tab" data-toggle="tab"><span>' + item[2] + '</span><button class="close" type="button" title="Remove this page">×</button><button class="edit" type="button" title="Edit tab Name">✎</button></a></li>'));
                        $('#tab-content').append($('<div class="tab-pane fade" id="' + item[3] + '"><ul></ul> <button class="icon-btn add-btn add-url">\n' +
                            '    <div class="add-icon"></div>\n' +
                            '    <div class="btn-txt">Add Current Page</div>\n' +
                            '  </button><button class="icon-btn add-btn add-note">\n' +
                            '    <div class="add-icon"></div>\n' +
                            '    <div class="btn-txt">Add Note</div>\n' +
                            '  </button></div>'));
                    }
                    if (item[0] !== "") {
                        tabDiv.children('ul').eq(0).append("<li data-uniqueNumber='" + item[4] + "' class='url'><a href=\"" + item[0] + "\" target=\"" + "_blank\" class='underline'>" + item[1] + "</a><button class='remove-link' >×</button></li>")
                    }
                    else{
                        tabDiv.children('ul').eq(0).append("<li data-uniqueNumber='" + item[4] + "' class='note'><a target=\"" + "_blank\" class='underline note'>" + item[1] + "</a><button class='remove-link' >×</button></li>")
                    }
                }
                else{
                    arr.splice(index, 1)
                }
                })
        }
    })

}

function set(args){
    chrome.storage.local.set(args);
  }

$(function(){
    let tabList = $("#tab-list")
    let tabContent = $("#tab-content")
    displayURLsv2()
    setTimeout(function () {
        chrome.storage.local.get('current', function(storage){
            if (storage.current){
                $('a[href="#' + storage.current + '"]').click();
                set({"current": null})
            }
            else{
                $("#tab-list").find('a').eq(0).click()
            }
        })
    }, 10)
    chrome.storage.local.get('storage', function(storage){
        let arr = Array.from(storage.storage)
        arr = arr.filter(x => !!x)
        set({"storage": arr})
    })
    
    $('#btn-add-tab').click(function() {
    let tabID = tabList.find('a').last().attr('href').toString().replace('#tab', '');
    tabID++
    let tabName = prompt('Enter a Tab Name', 'New Collection')
            if (tabName === null){
        tabName = 'New Collection'
    }
    $('#tab-list').append($('<li><a href="#tab' + tabID + '" role="tab" data-toggle="tab"><span>' + tabName + '</span><button class="close" type="button" title="Remove this page">×</button><button class="edit" type="button" title="Edit tab Name">✎</button></a></li>'));
    let noteButton = '<button class="icon-btn add-btn add-note">\n' +
        ' <div class="add-icon"></div>\n' +
        ' <div class="btn-txt">Add Note</div>\n' +
        ' </button>'
            tabContent.append(                        $('#tab-content').append($('<div class="tab-pane fade" id="tab' + tabID + '"><ul></ul> <button class="icon-btn add-btn add-url">\n' +
                            '    <div class="add-icon"></div>\n' +
                            '    <div class="btn-txt">Add Current Page</div>\n' +
                            '  </button>' + noteButton + '</div>')));
    let tabIdHref = 'tab' + tabID
        addItem(noteButton, "", "New Collection", tabIdHref)
  });
  tabList.on('click', '.close', function() {
    let tabID = $(this).parents('a').attr('href');
    let id = tabID.replace('#tab', '')
      chrome.storage.local.get('storage', function(storage){
          if (storage.storage){
              let arr = Array.from(storage.storage)
              arr.forEach(function(item){
                  let itemID = item[3].replace('tab', '')
                  if (itemID === id){
                      item[5] = false
                  }
              })
              set({"storage": arr})
          }
      })
    $(this).parents('li').remove();
    $(tabID).remove();

    let tabFirst = $('#tab-list a:first');
    tabFirst.tab('show');
  });
  tabList.on('click', '.edit', function() {
    let oldTabName = $(this).siblings("span").eq(0).text()
    let newTabName = prompt('Enter a Tab Name', oldTabName);
    if (newTabName !== null){
      chrome.storage.local.get('storage', function(storage){
          if (storage.storage){
              let arr = Array.from(storage.storage)
              arr.forEach(function(item){
                  if (item[2] === oldTabName){
                      item[2] = newTabName
                  }
              })
              set({"storage": arr})
          }
      })
            $(this).siblings("span").eq(0).text(newTabName)}
  });
    tabContent.on("click", ".add-url", function () {
        let addButton = $(this)
        chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
        let URL =  tabs[0].url;
        let Title = tabs[0].title;
        // alert(currentTabTitle + currentTabURL)
        addItem(addButton, URL, Title)
});
    })
    tabContent.on('click', ".add-note", function(){
        let addButton = $(this)
        let URL =  ""
        let Title = prompt("Enter a note. ", "Note");
        if (Title === null){
            Title = "Note"
        }
        addItem(addButton, URL, Title)

    })
    $(document).on("click", '.remove-link',function(event){
        event.stopPropagation();
        event.stopImmediatePropagation();
        let li = $(this).parent()
        let unique_url_number = li.attr('data-uniqueNumber')
        chrome.storage.local.get('storage', function(storage){
            if (storage.storage){
                let arr = Array.from(storage.storage)
                arr[unique_url_number][5] = false
                set({"storage": arr})
                set({"current": arr[unique_url_number][3]})
            }
        })
        li.remove()
    })
    $("#test").on("click", function () {
        chrome.tabs.query({"currentWindow": true}, function (tabs) {
            tabs.forEach(function (tab) {
                console.log(tab.url)
            })
        })
});
})
