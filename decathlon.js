const request=require("request-promise");
const cheerio=require("cheerio");
const fs=require("fs");



module.exports.test1=async (a)=>{
	var data=[];

  	var post = `{"q":"${a}"}` ;
	var options={
		method: 'POST'
		, uri: `https://www.decathlon.tn/search?controller=search&page=1&s=${a}&from-xhr`
		, gzip: true
		,  headers: {
			'X-Requested-With': 'XMLHttpRequest' ,
			"Content-Type" : "application/json;"
			}
			,resolveWithFullResponse: true
	};
	var x=await  request(options)
	.then( async (response)=>{
		if(response.statusCode!=200)
			return;
		$=cheerio.load(response.body);
		logo="https://www.decathlon.tn/"+$("img.logo").attr("src");
		$("div.item-product").each((i,el)=>{
				pic=$(el).find(".img-box-single > img")
				data.push({
					name:$(el).find('.title-single').text(),
					 img:$(el).find('.img-responsive').attr("data-src"),
					 url:pic.parent().parent().parent().attr("href"),
					 mark:"",
					 logo:logo,
					 price:$(el).find(".price-text-btn > button").text(),
					 oldPrice:null
					});

		});

		maxPage=$(".page-list > ul > li").last().prev().text();
		var arrayRequest=[];
		while((--maxPage)>0){
			options.uri=`https://www.decathlon.tn/search?controller=search&s=${a}&page=${maxPage+1}`;
			arrayRequest.unshift(
					request(options)

				);
		}

		await Promise.all(arrayRequest)
				.then(requestsData=>{
					 requestsData.forEach(response=>{
		if(response.statusCode!=200)
			return;
		$=cheerio.load(response.body);
						logo="https://www.decathlon.tn/"+$("img.logo").attr("src");
						$("div.item-product").each((i,el)=>{
							pic=$(el).find(".img-box-single > img")
							data.push({
								name:$(el).find('.title-single').text(),
								 img:pic.attr("data-src"),
								 url:pic.parent().parent().parent().attr("href"),
								 mark:"",
								 logo:logo,
								 price:$(el).find(".price-text-btn > button").text(),
								 oldPrice:null
								});

					});
							}
						);
					}).catch(error => {
					console.log(error.message)
				  });

	}).catch(function (err) {
        console.log(err);
    })
	return data;
}
