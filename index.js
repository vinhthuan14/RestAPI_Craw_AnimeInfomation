const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const dotenv = require("dotenv");
const bodyParse = require("body-parser");

const url = "https://kimetsu-no-yaiba.fandom.com/wiki/Kimetsu_no_Yaiba_Wiki";
const characterUrl = "https://kimetsu-no-yaiba.fandom.com/wiki/";
const titles = [];
const details = [];
const characters = [];
const images = [];
const gallerys = [];
const characterObj = {};
const app = express();
app.use(bodyParse.json({ limit: "50mb" }));
app.use(cors());
dotenv.config();
app.use(
    bodyParse.urlencoded({
        limit: "50mb",
        extended: true,
        parameterLimit: 50000,

    })
);

    //ROUTES
//GET ALL CHARACTERS
app.get("/v1", (req, resp) => {
    const thumbnails = [];
    const limit = Number(req.query.limit);
    try {
        axios(url).then((req) => {
            const html = req.data;
            const $ = cheerio.load(html);
            $(".portal", html).each(function () {
                const name = $(this).find("a").attr("title");
                const url = $(this).find("a").attr('href');
                const image = $(this).find("a > img").attr('data-src');
                thumbnails.push({
                    name: name,
                    url: "http://localhost:8000/v1" + url.split("/wiki")[1],
                    image: image
                })
            })
            if (limit && limit > 0) {
                resp.status(200).json(thumbnails.slice(0, limit));
            } else {
                resp.status(200).json(thumbnails);
            }
        })
    } catch (err) {
        resp.status(500).json(err);
    }
})
//GET A CHARACTER
app.get("/v1/:character", (req, resp) => {
    let url = characterUrl + req.params.character;
    // console.log(url)
    try {
        axios(url).then((res) => {
            const html = res.data;
            const $ = cheerio.load(html);
            $(".wikia-gallery-item", html).each(function () {
                gallerys.push($(this).find("img").attr("data-src"));
            })
            $("aside", html).each(function () {
                const image = ($(this).find("img").attr("src"));
                $(this).find("section > div > h3").each(function () {
                    titles.push($(this).text());
                });
                $(this).find("section > div > div").each(function () {
                    details.push($(this).text());
                });
                // console.log(image);
                if (image !== undefined) {
                    console.log(gallerys)
                    for (let i = 0; i < titles.length; i++) {
                        characterObj[titles[i].toLowerCase()] = details[i];
                    }
                    characters.push({
                        name: req.params.character.replace("_", " "),
                        ...characterObj,
                        image: image,
                        gallerys: gallerys,
                    });
                }
            });
            // console.log(images)
            resp.status(200).json(characters)
        })
    }catch(err){
        resp.status(500).json(err);
    }
})

//RUN PORT
app.listen(8000, () => {
    console.log("Server is running .....")
})