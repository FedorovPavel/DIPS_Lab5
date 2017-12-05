class car{
    constructor(refToMenu){
        this.menu = refToMenu;
        this.template;
        this.getCarTemplate();
    }

    getCarTemplate(){
        let self = this;
        const url = '/carTemplates';
        $.get(url, function(template){
            self.template = $.parseHTML(template);
        });
        return;
    }

    fillListWithCar(list){
        let self = this;
        for (let I = 0; I < list.length; I++){
            const content = list[I];
            let record = $(self.template).clone();
            $(record).attr('id', content.id);
            $(record).find('div.record_header').attr('carId',content.id)
                                                    .attr('filling',false)
                                                    .attr('state','close');
            $(record).find('div.record_header').click(function(){
                if ($(this).attr('state') == 'close'){
                    if ($(this).attr('filling') == 'false'){
                        self.getCar($(this).attr('carId'), this);
                        $(this).attr('filling', true);
                    } else {
                        $(record).find('.detail_info').removeClass('hidden');
                    }
                    $(this).find('.view_detail_info').removeClass('glyphicon-chevron-down');
                    $(this).find('.view_detail_info').addClass('glyphicon-chevron-up');
                    $(this).attr('state', 'open');
                } else {
                    $(this).find('.view_detail_info').removeClass('glyphicon-chevron-up');
                    $(this).find('.view_detail_info').addClass('glyphicon-chevron-down');
                    $(record).find('.detail_info').addClass('hidden');
                    $(this).attr('state', 'close');
                }
            });
            $(record).find('h4.title').text(content.Manufacturer + ' ' + content.Model);
            $(record).find('span.manufacture').text(content.Manufacturer);
            $(record).find('span.model').text(content.Model);
            $(record).find('span.type').text(content.Type);
            $(record).find('span.cost').text(content.Cost);
            $(record).find('button.create_order').attr('carId', content.id);
            $(record).find('button.create_order').click(function(sender){
                let carId = $(this).attr('carId');
                self.menu.createDraftOrder(content);
            });
            $(self.menu.getList()).append(record);
        }
    }
    
    getCars(page, count, bind) {
        let self = bind;
        const url = '/aggregator/catalog?page=' + page + '&count=' + count;
        $.get(url)
            .done(function(res){
                self.menu.clearList();
                self.fillListWithCar(res.content);
                self.menu.pagination(res.info.current, res.info.pages);
            })
            .fail(function(res){
                self.menu.clearList();
                self.menu.page = 0;
                self.menu.rendErrorTemplateToList(res.responseText, res.status);
                self.menu.pagination(0,0);
            })
    }
    
    updateCarInfo(record, info){
        const detail = $(record).find('.detail_info');
        $(detail).find('span.door').text(info.Doors);
        $(detail).find('span.person').text(info.Person);
        $(detail).find('span.locationCity').text(info.Location.City);
        $(detail).find('span.locationStreet').text(info.Location.Street);
        $(detail).find('span.locationHouse').text(info.Location.House);
        $(detail).removeClass('hidden');
    }
    
    getCar(id, sender) {
        let self = this;
        const url = '/aggregator/catalog/' + id;
        $.get(url, function(res){
            const record = $('div#list').find('div').filter(function(index){
                if (id == $(this).attr('id'))
                    return true;
            });
            self.updateCarInfo(record, res);
        })
        .fail(function(res){
            self.menu.rendErrorTemplate(res.responseText, res.status);
            $(sender).attr('filling','false');
        });
    }
}