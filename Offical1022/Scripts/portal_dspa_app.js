var needActiveContentTab = false;
$(function () {
    $("#dlg-detail").on("show.bs.modal", function (e) {
        needActiveContentTab = true;
        console.log('show modal');
        $("body").addClass("modal-open");
        
    }).on("hidden", function () {
        needActiveContentTab = false;
        console.log('hide modal');
        $("body").removeClass("modal-open");
    });

});

var app = new Vue({
    el: '#app-dspa',
    data: function () {
        return {
            detail: {id: '', title: '', content: '', sendtime: '', answer: ''},
            sections: [],
            curSection: null,
            curSectionIndex: 0
        };
    },
    mounted: function () {
        portalController.loadSomeLatestRequests(this);
    },
    methods: {
        dspa_switchTab: function (section, index) {
            portalController.dspa_switchTab(this, section, index);
        },
        showDetail: function (pa) {
            portalController.showDetail(this, pa);
        }
    },
    computed: {

    },
    updated: function () {
        if (needActiveContentTab) {
            $('#detail-content-tab').tab('show');
            //$('#detail-answer').tab('show');
            needActiveContentTab = false;
        }
    }
});

Vue.filter('formatDate', function (value) {
    if (value) {
        return moment(String(value)).format('DD/MM/YYYY HH:mm:ss');
    }
});






