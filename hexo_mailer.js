//Access Mandrill Mail
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('GPFPphz-FLOLFRfDIoQD3g');

//Require Node
var ejs = require('ejs');
var fs = require('fs');
var FeedSub = require('feedsub');

//Parse emails and email template
var csvFile = fs.readFileSync("friends_list.csv","utf8");
var emailTemplate = fs.readFileSync('email_template.ejs', 'utf8');
 
//Access blog content
var blogContent = new FeedSub('http://chuckpierce.github.io/atom.xml', {
        emitOnStart: true
});

var latestPosts = [];

//Send email template to contacts 
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
       console.log(result);   
  }, function(e) {
      // Mandrill returns the error as an object with name and message keys
      console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
      // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
  });
  }

//Contacts Parsing function
function csvParse(csvFile) {

	var csv_data = csvFile.split("\n");;
	var personObject;

	var object_array = []


   keys = csv_data.shift().split(",");
 
    csv_data.forEach(function(contact){
        contact = contact.split(",");
        personObject = {};
 
        for(var i =0; i < contact.length; i++){
            personObject[keys[i]] = contact[i];
        }
 
        object_array.push(personObject);
 
    })
 
    return object_array;
}

//Determine blog posts to put in email template
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

friendList.forEach(function(row){
 
    firstName = row["firstName"];
    numMonthsSinceContact = row["numMonthsSinceContact"];
    emailAddress = row["emailAddress"];
 
    templateCopy = emailTemplate;
 
    var customizedTemplate = ejs.render(templateCopy, 
                { firstName: firstName,  
                  monthsSinceContact: numMonthsSinceContact,
                  emailAddress: emailAddress,
                  latestPosts: latestPosts
                });

  //call sendEmail function
	sendEmail(firstName, emailAddress, "Chuck", "chuckmpierce@gmail.com", "New Email", customizedTemplate);
    })
 
 
});
