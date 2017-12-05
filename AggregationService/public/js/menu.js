var Menu;
class menu {
    constructor(){
        this.car            = new car(this);
        this.order          = new order(this);
        this.errorTemplate  = null;
        this.lastCount      = 20;
        this.page           = 0;
        this.pages;
        this.count          = 20;
        this.draftExecution = false;
        this.openTabs       = 'catalog';
        this.getErrorTemplate();
        this.bindHandleToHeader();
        this.recordCounter();
        this.changePager();
    };
    //  Error template

    //  Получение шаблона для вывода ошибок
    getErrorTemplate(){
        let self = this;
        const url = '/errorTemplates';
        $.get(url, function(template){
            self.errorTemplate = $.parseHTML(template);
        });
        return;
    }
    //  Отображение template
    rendErrorTemplate(err_msg, err_status){
        var self = this;
        let template = $(self.errorTemplate).clone();
        $(template).find('span.status_code').text(err_status);
        $(template).find('span.error_msg').text(err_msg);
        $('body').append(template);
        setTimeout(function(){
            $(template).remove();
        },5000);
        return;
    }

    //  Отображение template в листе
    rendErrorTemplateToList(err_msg, err_status){
        var self = this;
        self.clearList();
        self.page = 0;
        let template = $(self.errorTemplate).clone();
        $(template).find('span.status_code').text(err_status);
        $(template).find('span.error_msg').text(err_msg);
        $(template).removeClass('absolute-position');
        $(self.getList()).append(template);
        return;
    }
    
    //  Validate methods 
    checkPosIntNumber(text){
        if (text){
            let res = Number(parseInt(text));
            if (isNaN(res) || res < 0)
                return null;
            return res;
        }
        return null;
    }

    checkID(id){
        if (id){
            return id;
        } else {
            return null;
        }
    }

    checkPaySystem(text){
        const admissibleSystems = ['Сбербанк','Открытие','Возрождение','Тинькофф','RocketBank', 'Raiffeisen',
                                    'Альфа-банк'];
        if (text){
            let res = String(text);
            if (admissibleSystems.indexOf(res) != -1)
                return res;
            else 
                return null;
        } else {
            return null;
        }
    }

    checkAccount(text){
        if (text){
            const input = String(text);
            const accountParts = input.split(' ');
            if (accountParts.length < 4 || accountParts.length >= 6)
                return null;
            else {
                for (let I = 0; I < accountParts.length; I++){
                    const temp = Number(accountParts[I]);
                    if (isNaN(temp) || accountParts[I].length < 4){
                        return null;
                    }
                }
                return input;
            }
        } else {
            return null;
        }
    }

    checkCost(text){
        if (text){
            let number = parseFloat(text);
            if (isNaN(number) || number < 10.0)
                return null;
            else 
                return Number(number);
        } else {
            return null;
        }
    }

    ConvertStringToDate(date){
        date = String(date);
        if (!date)
            return null;
        const dateParts = date.split('-');
        if (!dateParts || dateParts.length != 3)
            return null;
        const year  = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]);
        const day   = parseInt(dateParts[2]);
        return day + '.' + month +'.' + year;
    }

    getList(){
        return 'div#list';
    }

    //  Инициализация меню
    bindHandleToHeader(){
        var self = this;
        const menuPills = $('ul#nav-pills');    
        const cars      = menuPills.find('li#automobile-pill');
        const orders    = menuPills.find('li#orders-pill');
        $(cars).click(function(){
            $(menuPills).find('li').removeClass('active');
            $(this).addClass('active');
            self.openTabs = 'catalog';
            self.page = 0;
            self.recordCounter();
            self.changePager(); 
            self.draftExecution = false;
        });
        $(orders).click(function(){
            $(menuPills).find('li').removeClass('active');
            $(this).addClass('active');
            self.openTabs = 'order';
            self.page = 0;
            self.recordCounter();            
            self.changePager(); 
            self.draftExecution = false;
        });
    }

    //  Изменение количества записей в листе
    recordCounter(){
        let self = this;
        $('select#count_record').change(function(sender){
            self.page = 0;
            self.lastCount = self.count;
            self.count = Number(this.value);
            self.changePager();    
        });
    }

    //  Очистка записей в листе
    clearList(){
        $('div#list').children().remove();
    }

    //  Изменение указателей не следующую страницу и на предыдущую
    pagination(current, pages){
        current = Number(current);
        pages = Number(pages);
        if (current == 0)
            $('ul#pager').find('li.previous').addClass('hidden');
        else {
            $('ul#pager').find('li.previous').removeClass('hidden');
            $('ul#pager').find('li.previous').attr('page', current - 1);
        }
        if (pages == current)
            $('ul#pager').find('li.next').addClass('hidden');
        else {
            $('ul#pager').find('li.next').removeClass('hidden');
            $('ul#pager').find('li.next').attr('page', current + 1);
        }
    }

    //  Обработчик для указателя на следующую страницу
    handleNextPage(method, bind){
        this.page++;
        method(this.page, this.count, bind);
        return;
    }

    //  Обработчик для указателя на предыдующую страницу
    handlePrevPage(method, bind){
        this.page--;
        method(this.page, this.count, bind);
        return;
    }

    //  Изменение контента листа
    changePager(){
        let self = this;
        let list = self.openTabs;
        const mainPager = $('ul#pager');
        const prev = $(mainPager).find('li.previous')[0];
        const next = $(mainPager).find('li.next')[0];
        $(prev).unbind('click');
        $(next).unbind('click');
        switch (list){
            case 'catalog':
                $(prev).click(function(){ self.handlePrevPage(self.car.getCars, self.car)});
                $(next).click(function(){ self.handleNextPage(self.car.getCars, self.car)});
                self.car.getCars(self.page, self.count, self.car);
                break;
            case 'order':
                $(prev).click(function(){ self.handlePrevPage(self.order.getOrders, self.order)});
                $(next).click(function(){ self.handleNextPage(self.order.getOrders, self.order)});
                self.order.getOrders(self.page, self.count, self.order);
                break;
        }
        return;
    }

    //  Заполнить Draft панель
    fillDraftPanel(panel, car){
        let self = this;
        //  Обработчик даты
        let dataHandleValidator = function(input_id, msg){
            let data = self.ConvertStringToDate($(panel).find('input#' + input_id).val());
            if (!data){
                $(panel).find('input#'+input_id).focus();
                $(panel).find('span.dateErr').text(msg);
                return;
            } else {
                $(panel).find('span.dateErr').text('');   
            }
        }
        //  Закрытие панели
        $(panel).find('button.btn_close').click(function(){
            $(panel).remove();
            self.draftExecution = false;
        });
        //  Заполнение полей
        $(panel).find('h2.title').text("Оформление заказа");
        $(panel).find('span.manufacture').text(car.Manufacturer);
        $(panel).find('span.model').text(car.Model);
        $(panel).find('span.type').text(car.Type);
        $(panel).find('span.cost').text(car.Cost);
        $(panel).attr('carId', car.id);
        //  Поле ошибок заполнения
        const err_line = $(panel).find('span.dataErr');
        //  Заполнение начала ренты 
        $(panel).find('input#startDate').focusout(function(){
            dataHandleValidator('startDate','Неправильная дата начала аренды');
        });
        //  Заполнение окончания ренты 
        $(panel).find('input#endDate').focusout(function(){
            dataHandleValidator('endDate','Неправильная дата окончания аренды');
        });
        //  Отправка данных
        $(panel).find('button.btn_submit').click(function(){
            self.sendRecordToDraft(panel);
        });
    }

    //  Отправка записи 
    sendRecordToDraft(panel){
        let self = this;
        //  Определение формы
        let form = $('form#draft_order');
        //  Формирование даты
        const data = {
            userID      : self.checkID('59f634f54929021fa8251644'),
            carID       : self.checkID($(panel).attr('carId')),
            startDate   : self.ConvertStringToDate($(form).find('input#startDate').val()),
            endDate     : self.ConvertStringToDate($(form).find('input#endDate').val())
        };
        //  Поле ошибок заполнения
        const err_line = $(panel).find('span.dataErr');
        //  Проверка ID
        if (!data.userID){
            $(err_line).text('Невереный UserID');
            return;
        }
        //  Проверка ID автомобиля
        if (!data.carID){
            $(err_line).text('Неверный CarID');
            return;
        }
        //  Проверка даты начала ренты
        if (!data.startDate){
            $(panel).find('input#startDate').focus();
            $(err_line).text('Неправильная дата начала аренды');
            return;
        }
        //  Проверка даты окончания ренты
        if (!data.endDate){
            $(panel).find('input#endDate').focus();
            $(err_line).text('Неправильная дата окончания аренды');
            return;
        }
        //  Cсылка на 
        const url = '/aggregator/orders/';
        //  Отправка post запроса
        $.post(url, data)
            .done(function(res){
                self.confirm_after_draft(panel, res);
            })
            .fail(function(res){
                self.rendErrorTemplate(res.responseText, res.status);
                $(panel).remove();
            });
    }

    //  Отправка запроса на подтверждения
    sendConfirmOrder(panel){
        let self = this;
        const id = self.checkID($(panel).attr('resID'));
        if (id){
            const url = '/aggregator/orders/confirm/' + id;
            let req = new XMLHttpRequest();
            req.open('PUT', url, true);
            req.onreadystatechange = function(){
                if (req.readyState != 4)
                    return;
                if (req.status == 200){
                    $(panel).remove();
                    self.draftExecution = false;
                } else {
                    self.rendErrorTemplate(res.responseText, res.status);
                    self.draftExecution = false;
                    $(panel).remove();
                }
            }
            req.send();
        } else {
            alert('Неверный ID заказа');
        }
    }

    confirm_after_draft(panel, res){
        let self = this;
        $(panel).find('.start_date').text(new Date(res.Lease.StartDate).toLocaleDateString());
        $(panel).find('.end_date').text(new Date(res.Lease.EndDate).toLocaleDateString());
        $(panel).find('.content').remove();
        $(panel).find('.button_field').remove();
        $(panel).attr('resID', res.ID);
        $(panel).find('button.btn_confirm').click(function(){
            self.sendConfirmOrder(panel);
        });
        $(panel).find('div.hidden').removeClass('hidden');
        return;
    }

    createDraftOrder(car){
        if (!this.draftExecution){
            let panel = $(this.order.draft).clone();
            this.fillDraftPanel(panel, car);
            this.draftExecution = true;
            $('body').append(panel);
        }
        else {
            let panel = $('div#draft_panel');
            this.fillDraftPanel(panel, car);
        }
    };
};

$(document).ready(function(){
    Menu = new menu();
});