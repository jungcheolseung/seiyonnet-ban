const board = window.location.pathname.split('/')[2]
const BAN_STYLE = 'background-color:#ff0000'
let banDict = {}

load()

function load() {
    // chrome.storage.sync.clear()
    chrome.storage.sync.get('seiyonBanList', ({seiyonBanList}) => {
        if (seiyonBanList) {
            banDict = seiyonBanList
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
    
            // console.log(banDict)
            if (
                banDict
                && checkNested(banDict, board, date)
                && banDict[board][date].includes(username.title)
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
            banDict
            && checkNested(banDict, board, postTime)
            && banDict[board][postTime].includes(commentId)
        ) {
            comment.style = BAN_STYLE
        }
    }
}


function handleButtonClick(date, id) {
    if (
        !checkNested(banDict, board, date)
        || (index = banDict[board][date].indexOf(id)) === -1
    ) {
        if (confirm(id + '를 차단하시겠습니까?')) {
            pushBlockItem(date, id)
            alert('차단했습니다.')
            window.location.reload()
        }
    } else {
        if (confirm(id  + '를 차단 해제하시겠습니까?')) {
            popBanId(date, id, index)
            alert('차단 해제했습니다.')
            window.location.reload()
        }
    }
}


/** 
 * 아이디를 차단 목록에서 제거합니다.
 * @param {string} date 날짜
 * @param {string} id 추가할 아이디
 * @param {number} [index] 인덱스
 */
function popBanId(date, id, index) {
    banDict[board][date].splice(index || banDict[board][date].indexOf(id), 1)

    if(banDict[board][date].length == 0) {
        delete banDict[board][date]
    }
    saveBanDict()
}


/** 
 * 아이디를 차단 목록에 추가합니다.
 * @param {string} date 날짜
 * @param {string} id 추가할 아이디
 */
function pushBlockItem(date, id) {
    if (typeof banDict[board] == 'undefined' || banDict[board] == null) {
        // console.log(board + ' ban list 생성')
        banDict[board] = {} // 새로운 dict
    }

    if (typeof banDict[board][date] == 'undefined' || banDict[board][date] == null) {
        // console.log(board + ' ' + date + ' ban list 생성')
        banDict[board][date] = new Array() // 새로운 array
    }

    banDict[board][date].push(id)

    saveBanDict()
}


function checkNested(obj, level,  ...rest) {
    if (obj === undefined) return false
    if (rest.length == 0 && obj.hasOwnProperty(level)) return true
    return checkNested(obj[level], ...rest)
}


function saveBanDict() {
    console.log(banDict)
    chrome.storage.sync.set({'seiyonBanList': banDict})
}
