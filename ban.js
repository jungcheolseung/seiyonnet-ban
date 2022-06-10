const board = window.location.pathname.split('/')[2]

load();

function load() {
    getBlockList(function(items) {
        let posts = document.getElementsByClassName("post_list_line")
        for (let post of posts) {
            if (post.className !== 'post_list_line header'){
                let time = post.querySelector('div.date > time').getAttribute('datetime')
        
                let username = post.getElementsByClassName('username')[0]
                let date = new Date(time)
                date.setHours(0, 0, 0, 0)
                date = date.toLocaleDateString()

                let key = board + '_' + date
        
                username.classList.add('button')
                username.addEventListener("click", function(){handleButtonClick(date, username.title)});

                if (typeof items[key] == "undefined" || items[key] == null) {
                } else {
                    if (items[key].includes(username.title)) {
                        post.style = 'background-color:#000000'
                    }
                }
            }
        }
    })
}

function handleButtonClick(date, title) {
    if (confirm('차단하시겠습니까?')) {
        pushBlockItem(board, date, title)
        window.location.reload()
    }
}


/** 
 * @description 아이디를 차단 목록에 추가합니다.
 * @param {string} type 차단 게시판
 * @param {string} date 날짜
 * @param {string} id 추가할 아이디
 */
function pushBlockItem(type, date, id) {
    getBlockList(function(items) {

        const key = type + '_' + date

        if (typeof items[key] == "undefined" || items[key] == null) { // 차단 목록 생성
            items[key] = new Array(); // 새로운 array
        }

        const index = items[key].indexOf(id)
        if (index === -1) {
            console.log(id + '차단');
            items[key].push(id)
            alert(id + '를 차단했습니다.');
        } else {
            if (confirm(id  + '는 이미 차단한 아이디입니다. 차단을 해제하시겠습니까?')) {
                items[key].splice(index)
                alert('차단을 해제했습니다.');
            }
        }
        chrome.storage.sync.set(items, function() { 
            //alert(data + " pushed!");
        });
        chrome.storage.sync.get(console.log)
    });
}

/** 
 * @description 차단 목록을 불러옵니다.
 * @param {function} callback 콜백 함수
 */
function getBlockList(callback) {
    chrome.storage.sync.get(null, function(items) {
        // console.log("items: " + JSON.stringify(items));
        callback(items);
    });
}
