/**
 * Copyright bei G. Füchsl - 2018
 */

"use strict";

var observationFactory = (function() {
        
    var vs = {
        addValidation: function(observations) {
            console.log("observationFactory: start addValidation - " + typeof observations);
            //if (typeof observations === 'object') {
                for(var i = 0; i < observations.length; i++) {
                    Object.defineProperty(observations[i], 'addCount', { value: i } );
                    
                    if (observations[i].code.coding[0].code =='29463-7') {
                    
                        Object.defineProperty(observations[i], 'addVal', { value: {                     
                                    counter:      i,
                                    showLog:    function() {
                                                    console.log("observation / body weight " + this.counter);
                                                }
                                }
                        });

                    } else {

                        Object.defineProperty(observations[i], 'addVal', { value: {                     
                                    counter:      i,
                                    showLog:    function() {
                                                    console.log("observation / other " + this.counter);
                                                }
                                }

                        });

                    }
                    console.log(observations[i]);
                }
            //}
        },
        getValidation: function(observations) {
            
            console.log("observationFactory: start getValidation");            
            console.log("_______________________________________");            
            for(var i = 0; i < observations.length; i++) {
                observations[i].addVal.showLog();                    
            }            
        }
    }

    return {
        addValidation: vs.addValidation,
        getValidation: vs.getValidation
    }

})();