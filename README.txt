- Make sure to have the newest versions of node installed.
- For bcrpyt, make sure to have all of the dependencies listed on https://www.npmjs.com/package/bcrypt
  - Specifically, make sure to follow the install guidelines for https://github.com/nodejs/node-gyp
- install nodemon globally (npm install nodemon -g)
  - nodemon is used to run the server during development. It puts watches on the files and restarts the server anytime a file changes
- do an npm install from within the Server directory
- depending on how the install goes, sqlite3 might need to be installed separately (npm install sqlite3 --save)
- to run the server, type 'nodemon app.js' from the Server directory.
- if any packages fail to load, install them with the --save option, recommit the packages.json file.



GIT:

"git pull" to update


COMMIT CHANGES:
"git add $changedFile"
"git commit"
"git push"


"node /home/rest/formulaWednesday/FwedServer/app/js" to launch server.
