module.exports = {
    checkPosIntNumber : function(string){
        if (string){
            let res = Number(parseInt(string));
            if (isNaN(res) || res < 0)
                return undefined;
            return res;
        }
        return undefined;
    },
    checkPageNumber : function(number) {
        if (number){
            let res = Number(parseInt(number));
            if (isNaN(res) || res < 0)
                return 0;
            return res;
        }
        return 0;
    },
    checkCountNumber : function(number) {
        if (number){
            let res = Number(parseInt(number));
            if (isNaN(res) || res < 0)
                return 20;
            return res;
        }
        return 20;
    },
    checkID : function(id){
        if (id){
            return id;
        } else {
            return undefined;
        }
    },
    checkPaySystem : function(string){
        const admissibleSystems = ['Сбербанк','Открытие','Возрождение','Тинькофф','RocketBank', 'Raiffeisen',
                                    'Альфа-банк'];
        if (string){
            let res = String(string);
            if (admissibleSystems.indexOf(res) != -1)
                return res;
            else 
                return null;
        } else {
            return undefined;
        }
    },
    checkAccount : function(string){
        if (string){
            const input = String(string);
            const accountParts = input.split(' ');
            if (accountParts.length < 4 || accountParts.length >= 6)
                return null;
            else {
                for (let I = 0; I < accountParts.length; I++){
                    const temp = parseInt(accountParts[I]);
                    if (isNaN(temp)){
                        return null;
                    }
                }
                return input;
            }
        } else {
            return undefined;
        }
    },
    checkCost : function(string){
        if (string){
            let number = parseFloat(string);
            if (isNaN(number) || number < 10.0)
                return null;
            else 
                return Number(number);
        } else {
            return undefined;
        }
    },
    ConvertStringToDate : function(date){
        if (!date)
            return null;
        const dateParts = date.split('.');
        if (!dateParts || dateParts.length != 3)
            return null;
        const year  = parseInt(dateParts[2]);
        const month = parseInt(dateParts[1]);
        const day   = parseInt(dateParts[0]);
        return new Date(year, month - 1, day);
    }
}