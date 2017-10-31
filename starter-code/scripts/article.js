'use strict';

function Article (rawDataObj) {
  this.author = rawDataObj.author;
  this.authorUrl = rawDataObj.authorUrl;
  this.title = rawDataObj.title;
  this.category = rawDataObj.category;
  this.body = rawDataObj.body;
  this.publishedOn = rawDataObj.publishedOn;
}

// REVIEWED: Instead of a global `articles = []` array, let's attach this list of all articles directly to the constructor function. Note: it is NOT on the prototype. In JavaScript, functions are themselves objects, which means we can add properties/values to them at any time. In this case, the array relates to ALL of the Article objects, so it does not belong on the prototype, as that would only be relevant to a single instantiated Article.
Article.all = [];

// COMMENTED: Why isn't this method written as an arrow function?
// Functions on prototypes, by their very nature of use, almost universally access the 'this', meaning the current object instance being constructed. Arrow functions eliminate the ability to 'pass in' an object to to itself from a different context, which would defeat the purpose of a constructor function in the first place.
Article.prototype.toHtml = function() {
  let template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // COMMENTED: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
  // Not sure? Check the docs!
  // The (predicate) ? (ifTrue) : (ifFalse) symtax is called a Ternanry operator. It evalutates the first expression, followed by a question mark, then executes the first option if the expression evaluates to true, and the second option if the value is false, and returns that value into the variable being set to the result of the ternary operator. We used this in a previous Lab, and in previous Katas.
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

// REVIEWED: There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEWED: This function will take the rawData, however it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

// COMMENTED: Where is this function called? What does 'rawData' represent now? How is this different from previous labs?
// After searching the document, we see that loadAll is called inside the 'fetchAll' function.
// rawData represents the exact same thing as last labs (now expanded to 250 article data-blobs), but now is not *called* rawData as a JS variable... instead, it sits nameless inside JSON until the user calls it the first time, *gives* it the name rawData, stores it back in localStorage, or attempts to retrieve it with that smae name after it have already been saves to localStorage once.
// In previous labs, we merely declared it as a variable.
Article.loadAll = rawData => {
  rawData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)))

  rawData.forEach(articleObject => Article.all.push(new Article(articleObject)))
}

// REVIEWED: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAll = () => {
  // REVIEWED: What is this 'if' statement checking for? Where was the rawData set to local storage?
  // COMMENTED: Trick-qweschin, it wasn't. We need to code that up down below.
  if (localStorage.rawData) {
    // REVIEWED: When rawData is already in localStorage we can load it with the .loadAll function above and then render the index page (using the proper method on the articleView object).

    //DONE: This function takes in an argument. What do we pass in to loadAll()?
    Article.loadAll(rawData);

    //DONE: What method do we call to render the index page?

    articleView.initIndexPage();

    // COMMENTED: How is this different from the way we rendered the index page previously? What the benefits of calling the method here?
    // Though I don't feel this is a good way to do things, we have added the initIndexPage() to a parent function, which handles the logic for gathering rawData from its proepr source, which is the prerequiste for loadAll, and initIndexPage (and initArticlePage, later).

  } else {
    // TODO: When we don't already have the rawData:
    // - we need to retrieve the JSON file from the server with AJAX (which jQuery method is best for this?)
    $.ajax({
      url: 'data/hackerIpsum.json',
      method: 'GET'
    })
    // - we need to cache it in localStorage so we can skip the server call next time
      .done(function(data){
        localStorage.setItem('rawData', data);
        // - we then need to load all the data into Article.all with the .loadAll function above
        articleView.loadAll(data);
        // - then we can render the index page
        articleView.initIndexPage();
      })
      .fail(function(){console.log('localStorage->rawData load has failed, AND json->rawData load has failed. Check yo shit and fix it.')});


    // COMMENTED: Discuss the sequence of execution in this 'else' conditional. Why are these functions executed in this order?
    // The main else conditional in fetchAll (this function) tests whether or not localStorage.rawData exists. If it does, we load from there, build and attach the articles with 'loadAll', and initIndexPage. If rawData is NOT in localStorage, we grab it from the false-database document on our local system, then loadAll and initIndexPage from that. FURTHERMORE, if that AJAX load fails for some reason, we write a sassy alert to the console, and do nothing.
  }
}
