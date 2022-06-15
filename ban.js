const board = window.location.pathname.split('/')[2]
const BAN_STYLE = 'background-color:#ff0000'
let ban_dict = {}

load()

function load() {
    // chrome.storage.sync.clear()
    chrome.storage.sync.get('seiyon_ban_list', ({seiyon_ban_list}) => {
        if (seiyon_ban_list) {
            ban_dict = seiyon_ban_list
        }
        changePostList()
        if (window.location.pathname.split('/')[3].startsWith('+')) {
            changeCommentList()
        }
    })
}


function changePostList() {
    const postList = Array.from(document.getElementsByClassName('post_list_line'))
    for (let post of postList) {
        if (post.className !== 'post_list_line header') {
            let datetime = new Date(post.querySelector('div.date > time').getAttribute('datetime'))
            datetime.setHours(0, 0, 0, 0)
            const date = datetime.toLocaleDateString()
    
            let username = post.children[3].children[1]
            username.style = 'cursor: pointer'
            username.addEventListener('click', function(){handleButtonClick(date, username.title)})
    
            // console.log(ban_dict)
            if (
                ban_dict
                && checkNested(ban_dict, board, date)
                && ban_dict[board][date].includes(username.title)
            ) {
                post.style = BAN_STYLE
            }
        }
    }
}


function changeCommentList() {
    const postInfo = document.querySelector('#board > div.post_header > div > div.post_info_detail').innerText
    const postTime = new Date(postInfo.split('|')[2].split(' ')[3]).toLocaleDateString()
    let commentList = Array.from(document.getElementsByClassName('comment_list')[0].children)
    for (let comment of commentList) {
        let commentName = comment.querySelector('div > div.comment_header > div.comment_info > span')
        const commentId = commentName.innerText.trim().replace('[글쓴이] ', '')
        commentName.style = 'cursor: pointer'
        commentName.addEventListener('click', function(){handleButtonClick(postTime, commentId)})
        if (
            ban_dict
            && checkNested(ban_dict, board, postTime)
            && ban_dict[board][postTime].includes(commentId)
        ) {
            comment.style = BAN_STYLE
        }
    }
}


function handleButtonClick(date, id) {
    if (
        !checkNested(ban_dict, board, date)
        || (index = ban_dict[board][date].indexOf(id)) === -1
    ) {
        if (confirm(id + '를 차단하시겠습니까?')) {
            pushBlockItem(date, id)
            alert('차단했습니다.')
        }
    } else {
        if (confirm(id  + '를 차단 해제하시겠습니까?')) {
            popBanId(date, id, index)
            alert('차단 해제했습니다.')
        }
    }
    window.location.reload()
}


/** 
 * 아이디를 차단 목록에서 제거합니다.
 * @param {string} date 날짜
 * @param {string} id 추가할 아이디
 * @param {number} [index] 인덱스
 */
function popBanId(date, id, index) {
    ban_dict[board][date].splice(index || ban_dict[board][date].indexOf(id), 1)

    if(ban_dict[board][date].length == 0) {
        delete ban_dict[board][date]
    }
    saveBanDict()
}


/** 
 * 아이디를 차단 목록에 추가합니다.
 * @param {string} date 날짜
 * @param {string} id 추가할 아이디
 */
function pushBlockItem(date, id) {
    if (typeof ban_dict[board] == 'undefined' || ban_dict[board] == null) {
        // console.log(board + ' ban list 생성')
        ban_dict[board] = {} // 새로운 dict
    }

    if (typeof ban_dict[board][date] == 'undefined' || ban_dict[board][date] == null) {
        // console.log(board + ' ' + date + ' ban list 생성')
        ban_dict[board][date] = new Array() // 새로운 array
    }

    ban_dict[board][date].push(id)

    saveBanDict()
}


function checkNested(obj, level,  ...rest) {
    if (obj === undefined) return false
    if (rest.length == 0 && obj.hasOwnProperty(level)) return true
    return checkNested(obj[level], ...rest)
}


function saveBanDict() {
    console.log(ban_dict)
    chrome.storage.sync.set({'seiyon_ban_list': ban_dict})
}
