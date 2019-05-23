const { openNewGitHubIssue, debugInfo } = require('electron-util');

// unhandled({
//   showDialog: true,
//   reportButton: error => openNewGitHubIssue({
//     user: 'Spring3',
//     repo: 'redtime',
//     body: `Please describe the issue as detailed as you can\n\n---\n### Error Stack:\n \`\`\`\n${error.stack}\n\`\`\``
//   })
// });



module.exports = {
  report: error => openNewGitHubIssue({
    user: 'Spring3',
    repo: 'redtime',
    body: `Please describe the issue as detailed as you can\n\n---\n### Error Stack:\n \`\`\`\n${error.stack}\n\`\`\`\n### Debug Info:\n \`\`\`\n${debugInfo()}\n\`\`\``
  })
};
