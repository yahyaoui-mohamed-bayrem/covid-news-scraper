const axios = require('axios');
const cheerio = require('cheerio');
// const util = require('util');
// const url = require('url');

const covidNewsScraper = (scrapingLink = 'https://www.google.com/search?hl=en&q=covid+news&source=lnms&tbm=nws') => {
// accessing to google search with these params: 
// (hl=en)english language, (q=covid+news)search keys,  (tbm=nws)selecting google's news table
axios.get(scrapingLink)
    .then( async response => {
        const $ = await cheerio.load(response.data); // await is just an assurence that the page has loaded
        const articles = await $('.ZINbbc');
        let result = [];// will be an array of objects representing scraping result
        articles.each(async (i=1, element) => {
            // the first & last selections are not included: just a google thing i guess (i don't know why)
            if (i!=0 && i!=11) { 
            const link = $(element).find('.kCrYT').first().find('a').attr('href').replace(/&sa(.*?)+/g,'').replace('/url?q=','');
            const title = $(element).find('.BNeawe').html();
            // const img = $(element).find('.kCrYT').last().find('a').attr('href');//.find('.EYOsld');//.attr('src');
            const time = $(element).find('.r0bn4c').first().text();
            const description = $(element).find('.s3v9rd').last().text().replace(/(.*?)� /g,'');
            const source = $(element).find('.UPmit').text();

            // // console logging for testing purposes only
            // console.log(i+' -- title: '+title);
            // console.log(source);
            // console.log(link);
            // console.log(time);
            // console.log(url.parse(img, { parseQueryString: true }).query.q);
            // console.log(description);

            result = [ ...result, { title, source, time, link, description } ];
            }        
        });
        // getting the nextPageLink of search for a "more news" button in the frontend
        const nextPageLink = 'https://www.google.com'+$('.nBDE1b').attr('href');
        // // for testing
        // console.log(nextPageLink);

        // getting images from the links
        result.map(element => {
            const { link } = element;
            axios.get(link)
                .then( response => {
                    const $ = cheerio.load(response.data);
                    const image = $('img').first().attr('src');
                    element = { ...element, image };
                    console.log(image);
                })
                .catch(error=>console.log(error));
        });
        const myStatus = result.length === 0 ? '204: No Content' : '200: ok';
        return { scraperStatus: myStatus, result, nextPageLink }
    })
    .catch(error =>{ 
        console.log(error);
        return { scraperStatus: 'scraper error', errorMsg: error, result=[] }
    });
}

module.exports = covidNewsScraper;