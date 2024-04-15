// Get the mood history from local storage
function getMoodHistory() {
    var moodStorage = JSON.parse(localStorage.getItem("moodsArray"));
    if(moodStorage === null){
        return;
    } else {

        // Create up to 8 HTML elements displaying the past moods
        for (var i = 0; i < moodStorage.length; i++) {
            if (i > 7) {
                return;
            } else {
                var historyRow = $(".small-up-2");
                var div = $("<div>").addClass("column");
                var img = $("<img>").addClass("thumbnail" + i);
                img.attr("src", moodStorage[i].gif);
                div.append(img);
                var text = $("<h5>").addClass("text-display" + i);
                text.text(moodStorage[i].name.charAt(0).toUpperCase() + moodStorage[i].name.slice(1));
                div.append(text);
                var date = $("<h5>").addClass("date-display" + i);
                date.text(moodStorage[i].timeStamp);
                div.append(date);
                historyRow.append(div);
            }
        }
    }
}
getMoodHistory()