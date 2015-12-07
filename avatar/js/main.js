function get_identicon (text) {
	text = text.trim();
	if (text == "") {
		text = "a";
	}
	var OK = /^[\u4e00-\u9fa5]|[a-zA-Z]$/.test(text[0]);
	if (!OK) {
		text = "a";
	}
    $("#show_identicon")[0].src='https://initials.herokuapp.com/' + text;
}
