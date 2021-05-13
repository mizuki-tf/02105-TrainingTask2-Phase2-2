'use strict';
const pug = require('pug');
const util = require('./handler-util');
const Post = require('./post');
const BadReport = require('./badreport');

function handleBadreport(req, res) {
  switch (req.method) {
    case 'POST':
      let body = [];
      req.on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        body = Buffer.concat(body).toString();
        const decoded = decodeURIComponent(body);
        const matchResult = decoded.match(/postId=(.*)&reportedBy=(.*)&oneTimeToken=(.*)/);
        if (!matchResult) {
          util.handleBadRequest(req, res);
        } else {
          const postId = matchResult[1]
          const reportedBy = matchResult[2];
          const requestedOneTimeToken = matchResult[3];
          if (oneTimeTokenMap.get(req.user) === requestedOneTimeToken) {
            console.info('違反報告です: ' + reportedBy);
            BadReport.create({
              postId: postId,
              reportedBy: reportedBy,
            }).then(() => {
              oneTimeTokenMap.delete(req.user);
              handleRedirectPosts(req, res);
            });
          } else {
            util.handleBadRequest(req, res);
          }
        }
      });
      break;
    case 'GET':
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      });
      if (req.user !== 'admin') {
        res.end('<!DOCTYPE html><html lang="ja"><body>' +
        '<h1>違反報告一覧</h1>' +
        '<h2>閲覧権限がありません</h2>' +
        '<a href="/posts">戻る</a>' +
        '</body></html>'
        );
      } else {
        const Badtitle = [];
        BadReport.findAll({ 
          include: [{
              model: Post,
            }]
        }).then((badreport) => {
          for(let detail of badreport) {
            Badtitle.push(detail);
          }
          res.end(pug.renderFile('./views/badreports.pug', {
            badreports: Badtitle
          }));
        });
      }
      break;
    default:
      util.handleBadRequest(req, res);
      break;
  }
}

module.exports = {
  handleBadreport
};