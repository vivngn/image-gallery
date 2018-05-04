const express = require('express');
const request = require('request');
const fs = require('fs');
const hbs = require('hbs');
const port = process.env.PORT || 8080;

const addAlbum = require('./addAlbum.js');
const getThumbs = require('./getThumbnails.js');
const favPic = require('./facPic.js');


var thumbs = [],
    nquery = '';


var app = express();




hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));


/**
 * Routes the / (root) path
 */

app.get('/', (request, response) => {
    /**
    * Displays the main page
    */
    response.render('search.hbs')
});


/**
 * Routes the /results path
 */

app.get('/results', (request, response) => {
    /**
     * Grabs the query from the GET response
     */
    nquery = response.req.query.query;

    /** 
     * get picture links from the query
     */
    getThumbs.getThumbnails(nquery, (errorMessage, results) => {
        /** 
         * if there's no pictures returned, an error message will be displayed
         */
        if (results == undefined) {
            console.log(errorMessage);
            response.send('<h1>' + errorMessage + '</h1>');
        /** 
         * else the URLs will be encapsulated in HTML code and written to a JSON file
         */
        } else {
            global.formatThumbs = '<br>';
            global.listofimgs = [];
            global.galThumbs = '<br>';

            for (i = 0; i < results.length; i++) {
               listofimgs.push(results[i]);
               galThumbs += '<img class=thumbnails src=' + results[i] + '>';
               formatThumbs += '<img class=thumbnails src=' + results[i] + '><form id=favForm method=GET action=/favorite>'+
               '<button name=favorite id=favorite value=' + i + '' + ' type=submit>❤</button></form>';
            }

            var readresults = fs.readFileSync('results.json');

            /** 
             * the JSON file is split into parts because we weren't able to use app.render properly
             */
            var total = JSON.parse(readresults);
            var part1 = total.part1;
            var part2 = total.part2;

            /** 
             * the HTML code is sent to be displayed
             */
            response.send(part1 + part2 + formatThumbs);
          }
    });
});

/** 
 * Routes the /gallery path
 */

app.get('/gallery', (request, response) => {
  /** 
   * if user enters title and clicks the "save" button, an album will be added to gallery
   */

  if (request.query.title != undefined){
    addAlbum.addAlbum(request.query.title, galThumbs);
  }
  /** 
   * if there's no albums returned, an error message will be displayed
   */

    try {
      var readalbum = fs.readFileSync('album.json');
      var piclist = JSON.parse(readalbum);
      var gallery_val = '';
      for (var i=0; i<piclist.length; i++){
          gallery_val += '<div id=galDiv <br> <b>' + piclist[i].title +'</b><br><div id=galDivPic <img id=galDivPic src='+ piclist[i].imgs + ' </div> </div>';
      }

      var readgallery = fs.readFileSync('gallery.json');
      var galPage = JSON.parse(readgallery);
      var galPage1 = galPage.gal1;

      response.send(galPage1 + gallery_val);

    } catch (SyntaxError) {
      response.send('<font size="6"><b>No albums<b></font>');
    }
});


/** 
 * Routes the /favorite path
 */

app.get('/favorite', (request, response) => {

/** 
   * if user clicks the "favorite" button, the image will be added to favorite
   */
  if (request.query.favorite != undefined){
    favPic.favPic(listofimgs[request.query.favorite]);

/** 
   * if there's no favorite images returned, an error message will be displayed
   */
  } try {
    var readimgs = fs.readFileSync('imgs.json');
    var favlist = JSON.parse(readimgs);
    var fav_val = '';

    for (var i=0; i<favlist.length; i++){
       fav_val += '<img src=' + favlist[i] + ' <br>';
    };

    var fav = fs.readFileSync('favorite.json');
    var favP = JSON.parse(fav);
    var favPage = favP.fav1;

    response.send(favPage + fav_val);

    } catch (SyntaxError) {
      response.send('<font size="6"><b>No favorite images<b></font>');
    }
});

//saving/pushing favorite pictures//


/** 
   * push the server up on the port
   */
app.listen(port, () => {
    console.log(`Server is up on the port ${port}`);

});