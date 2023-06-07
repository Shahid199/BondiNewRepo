module.exports = {
    apps : [
  {	
      name:'bondipathshala',
      instances:'max',
      exec_mode:'cluster',
      script: 'app.js',
      watch: '.'
    }]
  }
  