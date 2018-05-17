
//grab all the dom elements required and store them in vars
var scanlines = $(".scanlines");
var term = $("#term");
var bg = $(".bg");


//function wrapper as to not pollute global scope
//takes in jquery dollar sign
$(function($, undefined) {
    //sets the animation state change var to false
    var anim = false;

    function typed(finish_typing) {
        //returns a function that can be passed the parameters to animate the text
        return function(term, message, delay, finish) {
            //sets animation state change to true
            anim = true;
            //gets the current term propmt
            var prompt = term.get_prompt();
            //coutner var set at 0
            var c = 0;
            //if the message actually has text in it
            if (message.length > 0) {
                //temp set the propmt as nothing (to hide it)
                term.set_prompt('');
                //create new prompt empty string
                var new_prompt = '';
                //create function with time interval
                var interval = setInterval(function() {
                    //creates character var with the first letter in the message
                    var chr = $.terminal.substring(message, c, c+1);
                    //sets the new propmt to the characters in addition to its current value
                    new_prompt += chr;
                    //finally sets the propmt to the new one
                    term.set_prompt(new_prompt);
                    //iterates counter var to do it again animating the entire message
                    c++;
                    //check to see if the counter has the same value as the entire message
                    if (c == length(message)) {
                        //if it has stop the animation clear the interval timer
                        clearInterval(interval);
                        // execute in next interval
                        setTimeout(function() {
                            // swap command with prompt
                            finish_typing(term, message, prompt);
                            //stop animation by toggeling the animation value
                            anim = false
                            //stops all animations and removes qeued animations
                            finish && finish();
                            //delay vlaue for typing speed in miliseconds
                        }, delay);
                    }
                    //delay vlaue for typing speed in miliseconds
                }, delay);
            }
        };
    }
    //function to return the char length
    function length(string) {
        string = $.terminal.strip(string);
        return $('<span>' + string + '</span>').text().length;
    }
    //function to animate the propmt as well | using the typed function
    var typed_prompt = typed(function(term, message, prompt) {
        //set_propmt function part of API
        term.set_prompt(message + ' ');
    });
    //function that actually sets the propmt and also echoes the message
    var typed_message = typed(function(term, message, prompt) {
        term.echo(message)
        term.set_prompt(prompt);
    });

    term.terminal(function(command) {
        //used if we want to create an actual interpreter
        // if (command !== '') {
        //     try {
        //         var result = window.eval(command);
        //         if (result !== undefined) {
        //             this.echo(new String(result));
        //         }
        //     } catch(e) {
        //         this.error(new String(e));
        //     }
        // } else {
        //    this.echo('');
        // }

        //if then statement chain that serves as the way we handle command interpretation
        if (command == 'help') {
            this.echo("Here is a list of commands to help you navigate:\nexit\nclear\ncd\ncd../\nls\nmkdir");
        } else if (command == 'exit') {
            this.destroy();
        } else if (command == 'cd') {
            this.echo("This stands for \"Change Direcroy\" and allows a user to change the active directory to the name of child directory.");
        } else if (command == 'cd../') {
            this.echo("This stands for \"Change Direcroy Up A Level\" and allows a user to change the active directory to the parent directory.");
        } else if (command == 'ls') {
            this.echo("This stands for \"List\" and allows a user to view a listing of all files and directories inside.");
        } else if (command == 'mkdir') {
            this.echo("This stands for \"Make Directory\" and allows a user to create a directory inside.");
        } else if (command == 'echo') {
            this.echo("This stands for \"Make Directory\" and allows a user to create a directory inside.");
        }

        //if a user types in anything but the commands shown above return an empty string
        else {
            this.echo('');
        }
    }, {
        //first initial string prinited when term is created and displayed
        greetings: 'MAINFRAME TERM DEF', 
        //identifier of term
        name: 'term_def',
        //deafualt terminal prompt (changes later)
        prompt: '$unk_user> ',
        //gives focus to the terminal automatically when its created
        focus: true,
        //called when the terminal is first created (before displaying prompt or anything else)
        onInit: function(term) {
            
            //function call defined below
            set_size();
            
            //this function call handles the typing effect  
            typed_message(term, "Wake up...", 250, function() {
                //second message after the first one is called above
                var msg = "Before we begin I need some info.";
                typed_message(term, msg, 150, function() {
                    //after the typing is complete we call the ask questions method which begins user input
                    ask_questions(0);
                    
                });
            });
        },
        //part of API
        keydown: function(e) {
            //disable keyboard when animating
            if (anim) {
                return false;
            }
        },
        //Again part of API but is called everytime viewport changes
        onResize: function(){
            //setting size everytime it is changed
            set_size();
        },
        //this function is called everytime the terminal loses focus i.e. if you click out of it
        onBlur: function(){
            //Jquery focus method
            term.focusin();
            //does not lose its focus by returning false
            return false;
        },
        //does not scroll to bottom if we are scrolled up and user starts typing
        scrollOnEcho: false,
        //wraps if text goes off screen *not working*
        wrap: true,
    });

    


    function set_size() {
        //gets height and width of window
        // for window height of 170 it should be 2s
        
        var height = $(window).height();
        var width = $(window).width();
      
        //used in calc the height offset of the scanlines
        var time = (height * 2) / 170;
        //this is the new css var definition 
        scanlines[0].style.setProperty("--time", time);
    }

    //creates array of properties to apply masking to 
    var mask = ["password"];
    //creates empty array of strings that will be populated later
    var settings = {};
    //array of objects contianing setting questions
    var questions = [
        {
            name: "alias",
            text: 'Enter your alias name',
            prompt: "alias: "
        },
        {
            name: "password",
            text: "Enter your password"
        },
    ];
    //primary function to handle questions and takes in the step you are on (which question)
    function ask_questions(step) {
        //assigns question var to specific step question
        var question = questions[step];
        //if there is a valid question
        if (question) {
            //if there is some text in the question
            if (question.text) {
                //display the question in bold white tect
                term.echo('[[b;#fff;]' + question.text + ']');
            }
            //finds the question that has the password field using indexOf and then stores the chars in a var
            var show_mask = mask.indexOf(question.name) != -1;
            //another api method push takes in the command
            term.push(function(command) {
                //if the show mask var is true then set maks to false
                if (show_mask) {
                    term.set_mask(false);
                }
                //javascript boolean object, if question string is empty of NAN than it is false
                if (question.boolean) {
                    var value;
                    //use regular expression to check for Yes input
                    if (command.match(/^Y(es)?/i)) {
                        //set value to true
                        value = true;
                    //use regular expression to check for Yes input
                    } else if (command.match(/^N(o)?/i)) {
                        //set value to false
                        value = false;
                    }
                    //if user types value that is not what we want that just pop the term and go to the next question
                    if (typeof value != 'undefined') {
                        settings[question.name] = value;
                        term.pop();
                        ask_questions(step+1);
                    }
                    //store the value and move on to the next question
                } else {
                    settings[question.name] = command;
                    term.pop();
                    ask_questions(step+1);
                }
            }, {
                //store the string question prompt or question name and append on the : character
                prompt: question.prompt || question.name + ": "
            });
            // set command and mask need to called after push
            // otherwise they will not work
            if (show_mask) {
                term.set_mask(true);
            }
            if (typeof settings[question.name] != 'undefined') {
                if (typeof settings[question.name] == 'boolean') {
                    term.set_command(settings[question.name] ? 'y' : 'n');
                } else {
                    term.set_command(settings[question.name]);
                }
            }
        } else {
            //after everything is done call the finish function to display everything
            finish();
           
        }
    }
    //finish function
    function finish() {
        
        //finish the input and display your inputs
        term.echo('Your settings:');
        var str = Object.keys(settings).map(function(key) {
            var value = settings[key];
            
            
            if (mask.indexOf(key) != -1) {
            // mask everything except first and last character
                var split = value.match(/^(.)(.*)(.)$/, '*');
                value = split[1] + split[2].replace(/./g, '*') + split[3];
            }
            //return the value with a bold casing
            return '[[b;#fff;]' + key + ']: ' + value;
            
           //joins everything together by the return or new line values
        }).join('\n');
        //outputs the settings
        term.echo(str);
        term.push(function(command) {
            //checks to see if the user types the letter Y for yes by using a regular expression match call. Ignores upper/lower case
            if (command.match(/^y$/i)) {
                //outputs the settings string 
                term.echo(JSON.stringify(settings));
                //renables history
                term.pop().history().enable();
                //clears terminal completely
                term.clear();
                //sets new prompt to use 
                //** todo: make propmt dynamic with alias name - couldnt figure it out tried everything */
                term.set_prompt("$" + 'jake>');

                //checks to see if the user types the letter n for no by using a regular expression match call. Ignores upper/lower case
            } else if (command.match(/^n$/i)) {
                //gets the terminal out of its mode
                term.pop();
                //starts the questions again so we can edit
                ask_questions(0);
            }
        }, {
            //object with string value to show at the end of settings input for confimation
            prompt: 'Are those correct (y|n): '
        });
    }

    //makes it so a user cannot use arrow keys to go back in history and see what was typed
    term.history().disable();

    });


//if click the screen image on top it focuses the terminal
bg.click(function(){
    term.focusin();
    // console.log("bg clicked");
})


    
