let chart;

async function analyze(){

const url=document.getElementById("url").value;
const status=document.getElementById("status");

if(!url){
alert("Enter a YouTube URL");
return;
}

status.innerText="Analyzing comments...";

try{

const response=await fetch("https://nlp.charansai.me/analyze",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
video_url:url
})
});

const data=await response.json();

if(data.error){
status.innerText=data.error;
return;
}

status.innerText="Analysis complete";

document.getElementById("videoInfo").style.display="block";

document.getElementById("thumbnail").src=data.video.thumbnail;

document.getElementById("videoTitle").innerText=data.video.title;

document.getElementById("videoChannel").innerText="Channel: "+data.video.channel;

document.getElementById("videoViews").innerText="Views: "+data.video.views;

document.getElementById("commentCount").innerText="Comments analyzed: "+data.total;

const langDiv=document.getElementById("languages");
langDiv.innerHTML="";

for(const lang in data.languages){

const div=document.createElement("div");

div.innerHTML=`${lang}: <b>${data.languages[lang]}</b>`;

langDiv.appendChild(div);

}

const wordDiv=document.getElementById("topWords");
wordDiv.innerHTML="";

data.top_words.forEach(word=>{

const span=document.createElement("span");

span.className="word-chip";

span.innerText=word;

wordDiv.appendChild(span);

});

const commentDiv=document.getElementById("topComments");
commentDiv.innerHTML="";

data.top_comments.forEach(comment=>{

const div=document.createElement("div");

div.className="comment-box";

div.innerText=comment;

commentDiv.appendChild(div);

});

drawChart(
data.positive,
data.negative,
data.neutral
);

}catch(err){

status.innerText="Server error";

}

}

function drawChart(positive,negative,neutral){

const ctx=document.getElementById("sentimentChart");

if(chart){
chart.destroy();
}

chart=new Chart(ctx,{
type:"pie",
data:{
labels:["Positive","Negative","Neutral"],
datasets:[{
data:[positive,negative,neutral],
backgroundColor:[
"#28a745",
"#dc3545",
"#ffc107"
]
}]
},
options:{
responsive:true
}
});

}
