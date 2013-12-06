function DataTimeUtils(){

    var that = this;

    this.presentDate = function(){
        var date = new Date();
        return that.dateStringFormat(date);
    };

    this.nextDate = function(){
        var date = new Date();
        var nextDate = new Date();

        nextDate.setDate(date.getDate()+1);
        return that.dateStringFormat(nextDate);
    };

    this.previousDate = function(){
        var date = new Date();
        var prevDate = new Date();

        prevDate.setDate(date.getDate()-1);
        return that.dateStringFormat(prevDate);
    };

    /*
     * Returns Date-Time slots for period +12/-12 hrs counting from the present hour.
     * Suppose time of searching is 17.00, Date-TIme slots returned:
     * {15:"2013-01-05", 18:"2013-01-05", 21:"2013-01-05", 0:"2013-01-06", 12:"2013-01-05", 9:"2013-01-05", 6:"2013-01-05"}
     * */

    this.getDateTimeSlots = function(range){
        var timeSlots = {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:6, 7:6, 8:6, 9:9, 10:9, 11:9, 12:12,
            13:12, 14:12, 15:15, 16:15, 17:15, 18:18, 19:18, 20:18, 21:21, 22:21, 23:21};
        var dateTimeSlots = {};

        var dateNow = new Date();
        var currentHourPlus12 = dateNow.getHours();
        var currentHourMinus12 = dateNow.getHours();


        for(var i=0; i< range; i++){
            currentHourPlus12 = currentHourPlus12 + i;
            if(currentHourPlus12 <=23){
                dateTimeSlots[timeSlots[currentHourPlus12]] = that.presentDate();
            }
        }

        for(i=0; i<range; i++){
            currentHourMinus12 = currentHourMinus12 - i;
            if(currentHourMinus12 >= 0){
                dateTimeSlots[timeSlots[currentHourMinus12]] = that.presentDate();
            }
        }

        return dateTimeSlots;
    };

    this.dateStringFormat = function(date){
        var curr_date = date.getDate();
        var curr_month = date.getMonth() + 1; //Months are zero based
        var curr_year = date.getFullYear();
        return curr_year + "-" + curr_month + "-" + curr_date;
    }


};

module.exports = DataTimeUtils;