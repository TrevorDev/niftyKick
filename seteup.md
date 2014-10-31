install node
install haproxy
get config.js
setup databases
npm install forever -g
NODE_ENV=production forever start -o logs/out.log -e logs/err.log -c "node --harmony" app.js


