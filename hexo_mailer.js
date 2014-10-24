var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('GPFPphz-FLOLFRfDIoQD3g');

var ejs = require('ejs');
var fs = require('fs');
var FeedSub = require('feedsub');

var csvFile = fs.readFileSync("friends_list.csv","utf8");
var emailTemplate = fs.readFileSync('email_template.ejs', 'utf8');
 
 
var blogContent = new FeedSub('http://chuckpierce.github.io/atom.xml', {
        emitOnStart: true
});

var latestPosts = [];

function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
  var message = {
      "html": message_html,
      "subject": subject,
      "from_email": from_email,
      "from_name": from_name,
      "to": [{
              "email": to_email,
              "name": to_name
          }],
      "important": false,
      "track_opens": true,    
      "auto_html": false,
      "preserve_recipients": true,
      "merge": false,
      "tags": [
          "Fullstack_Hexomailer_Workshop"
      ]    
  };
  var async = false;
  var ip_pool = "Main Pool";
  mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
      //console.log(message);
       console.log(result);   
  }, function(e) {
      // Mandrill returns the error as an object with name and message keys
      console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
      // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
  });
  }

function csvParse(csvFile) {

	var csv_data = [];
	var word = ""

	var object_array = []

	for(var i = 51; i < csvFile.length; i++) {
		if(csvFile[i] === "," ) {
			csv_data.push(word);
			word = "";
			continue;
		}
		else if(csvFile[i] === "\n") {
			csv_data.push(word);
			word = "";
			var person = new personObject(csv_data);
			object_array.push(person);
			csv_data = [];
		} else {
			word += csvFile[i];
		}
	}
	return object_array;
}

function personObject(array) {
	this.first_name = array[0];
	this.last_name = array[1];
	this.months_since_contact = array[2];
	this.email_address = array[3];

}

blogContent.read(function(err,blogPosts){
    
    blogPosts.forEach(function(post){
    	var currentDate = new Date();
    	var sevenDays = 604800000;

    	for (key in post) {
    		if(key=== "published") {
    			var postDate = new Date(post[key]);
    			if(currentDate.getTime() - sevenDays < postDate.getTime()) {
    				post["link"] = post["link"]["href"];
    				latestPosts.push(post);
    			}
    		}
    	}

    })


friendList = csvParse(csvFile);

// console.log(friendList);

friendList.forEach(function(row){
 
    firstName = row["first_name"];
    numMonthsSinceContact = row["months_since_contact"];
    emailAddress = row["email_address"];
 
    // we make a copy of the emailTemplate variable to a new variable to ensure
    // we don't edit the original template text since we'll need to us it for 
    // multiple emails
 
    templateCopy = emailTemplate;
 
    // use .replace to replace FIRST_NAME and NUM_MONTHS_SINCE_CONTACT with firstName and  monthsSinceLastContact  
    var customizedTemplate = ejs.render(templateCopy, 
                { firstName: firstName,  
                  monthsSinceContact: numMonthsSinceContact,
                  emailAddress: emailAddress,
                  latestPosts: latestPosts
                });
 
    //console.log(customizedTemplate);


	sendEmail(firstName, emailAddress, "Chuck", "chuckmpierce@gmail.com", "New Email", customizedTemplate);
    })
 
 
});
