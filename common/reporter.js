const { openNewGitHubIssue, debugInfo } = require('electron-util');

module.exports = {
  report: (error) => openNewGitHubIssue({
    user: 'Spring3',
    repo: 'redshape',
    body: error && error instanceof Error
      // eslint-disable-next-line max-len
      ? `Please describe the issue as detailed as you can\n\n---\n### Error Stack:\n \`\`\`\n${error.stack}\n\`\`\`\n### Debug Info:\n \`\`\`\n${debugInfo()}\n\`\`\``
      : `Please describe the issue as detailed as you can\n\n---\n### Debug Info:\n \`\`\`\n${debugInfo()}\n\`\`\``
  })
};
