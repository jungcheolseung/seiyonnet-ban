const board = window.location.pathname.split('/')[2]
let ban_dict = {}

load()

function load() {
    // chrome.storage.sync.clear()
    chrome.storage.sync.get('seiyon_ban_list', ({ seiyon_ban_list }) => {
        // console.log("items: " + JSON.stringify(items))
        if (seiyon_ban_list) {
            ban_dict = seiyon_ban_list
        }
        changePage()
    })
}


function changePage() {
    let posts = document.getElementsByClassName("post_list_line")
    for (let post of posts) {
        if (post.className !== 'post_list_line header'){
            let time = post.querySelector('div.date > time').getAttribute('datetime')
    
            let username = post.getElementsByClassName('username')[0]
            let datetime = new Date(time)
            datetime.setHours(0, 0, 0, 0)
            const date = datetime.toLocaleDateString()

            username.classList.add('button')
            username.addEventListener("click", function(){handleButtonClick(date, username.title)})

            // console.log(ban_dict)
            if (ban_dict
                && typeof ban_dict[board] != "undefined"
                && typeof ban_dict[board][date] != "undefined" &&
                ban_dict[board][date].includes(username.title)) {
                post.style = 'background-color:#ff0000'
            }
        }
    }
}


function handleButtonClick(date, title) {
    if (confirm('차단하시겠습니까?')) {
        pushBlockItem(date, title)
        window.location.reload()
    }
}


/** 
 * @description 아이디를 차단 목록에 추가합니다.
 * @param {string} date 날짜
 * @param {string} id 추가할 아이디
 */
function pushBlockItem(date, id) {
    if (typeof ban_dict[board] == "undefined" || ban_dict[board] == null) { // 차단 목록 생성
        console.log(board + ' ban list 생성')
        ban_dict[board] = {} // 새로운 dict
    }

    if (typeof ban_dict[board][date] == "undefined" || ban_dict[board][date] == null) { // 차단 목록 생성
        console.log(board + ' ' + date + ' ban list 생성')
        ban_dict[board][date] = new Array() // 새로운 array
    }

    const index = ban_dict[board][date].indexOf(id)
    if (index === -1) {
        console.log(id + '차단')
        ban_dict[board][date].push(id)
        alert(id + '를 차단했습니다.')
        console.log(ban_dict)
    } else {
        if (confirm(id  + '는 이미 차단한 아이디입니다. 차단을 해제하시겠습니까?')) {
            ban_dict[board][date].splice(index)
            alert('차단을 해제했습니다.')
            if(ban_dict[board][date].length == 0) {
                console.log('길이 0')
                delete ban_dict[board][date]
            }
        }
    }
    console.log(ban_dict)
    chrome.storage.sync.set({'seiyon_ban_list': ban_dict})
}
