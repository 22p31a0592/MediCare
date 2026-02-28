    export const helper = {
        calculateDaysRemaining(pill){
            const startDate = new Date(pill.startDate);
            const totalDays = pill.durationDays;
            const daysPassed = Math.floor((Date.now()-startDate)/(1000*60*60*24));
            return Math.max(0,totalDays-daysPassed);
        },

        getFormattedDate(){
            const date = new Date();
            const option = {
                weekday: 'long',
                year : 'numeric',
                month : 'long',
                day : 'numeric'
            };
            return date.toLocaleDateString('en-US',option);
        },
        
    }
    export default helper;