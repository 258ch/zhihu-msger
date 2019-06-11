var request = require('sync-request')
var sleep = require('sleep')
var fs = require('fs')

var config = JSON.parse(fs.readFileSync('config.json', 'utf-8'))
// z_c0=".+?"
var cookie = fs.readFileSync('cookie', 'utf-8').trim()

function getUsersId(tid, start, num) {
    
    var url = `https://www.zhihu.com/api/v4/topics/${tid}/followers?limit=${num}&offset=${start}`
    
    var resStr = request('GET', url).body.toString()
    return JSON.parse(resStr).data.map(x => x.id)
    
}

function sendMsg(uid, co, cookie) {
    
    var postData = {"type": "common", "content": co, "receiver_hash": uid}
    var url = 'https://www.zhihu.com/api/v4/messages'
    var res = request('POST', url, {json: postData, headers : {Cookie: cookie}})
    if(res.statusCode == 200)
        return [1, '']
    else
        return [0, res.statusCode]

}

function main() {
    
    var topics = config.topics.map(x => x[0])
    var idx = Math.trunc(Math.random() * topics.length)
    var start = Math.trunc(Math.random() * 201)
    var uids = getUsersId(topics[idx], start, config.send_num)
    
    for(var uid of uids) {
        
        var res = sendMsg(uid, config.co, cookie)
        if(res[0])
            console.log(`${uid} 发送成功`)
        else
            console.log(`${uid} 发送失败：${res[1]}`)
        
        if(res[1] == 403)
            sleep.sleep(config._403_wait_sec)
        else
            sleep.sleep(config.wait_sec)
    }
}


if(require.main === module) main()

