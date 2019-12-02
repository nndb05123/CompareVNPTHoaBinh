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
            sections: []
        };
    },
    mounted: function () {
        this.loadSomeLatestRequests();
    },
    methods: {
        renderMultilineText: function (text) {
            var htmlLines = text.replace(/\n/g, '<br/>');
            return htmlLines;
        },
        shorten: function (text) {
            if (text === null || text === undefined) return '';
            if (text.length > 150) return text.substring(0, 100) + '...';
            return text;
        },
        loadSomeLatestRequests: function () {
            this.sections = [];
            //for (var i = 0; i < 5; i++) {
            //    var requests = [];
            //    for (var j = 0; j < 5; j++) {
            //        var status_desc = 'Đang xử lý bởi Chuyên viên Sở TT';
            //        if (j === 1) {
            //            status_desc = 'Mới tiếp nhận';
            //        }
            //        else if (j === 2) {
            //            status_desc = 'Đang xử lý bởi Chuyên viên Sở TT';
            //        }
            //        else if (j === 3) {
            //            status_desc = 'Đang xử lý bởi Lãnh đạo Sở TT';
            //        }
            //        else if (j === 4) {
            //            status_desc = 'Đã xử lý';
            //        }
            //        var r = {
            //            id: `REQ000${j}`,
            //            title: `Request ${j + 1}`,
            //            content: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).`,
            //            status_desc: status_desc,
            //            status_code: j,
            //            sendtime: '01/01/2019',
            //            answer: 'Until recently, the prevailing view assumed lorem ipsum was born as a nonsense text. “It s not Latin, though it looks like it, and it actually says nothing, ” Before & After magazine answered a curious reader, “Its ‘words’ loosely approximate the frequency with which letters occur in English, which is why at a glance it looks pretty real.” Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
            //            answer_from: 'So TTTT',
            //            answertime: '03/01/2019'
            //        };
            //        requests.push(r);
            //    }
            //    var sec = {
            //        title: `Section ${i + 1}`,
            //        requests: requests
            //    };
            //    this.sections.push(sec);
            //}
            this.sections = [];
            $.get(`${coreapiURL}/v1/requests/portal/latest/sections`, function (data) {
                var ls = clampList(data);
                ls.map(function (s) {
                    s.loadMoreSegment = 0;
                    s.requests = [];
                });
                app.sections = ls;
                app.sections.map(function (sec, index) {
                    app.loadMoreSection(sec, index);
                });
            });
        },
        loadMoreSection: function (section, index) {
            var loadingIcon = $('.dspa-section.sec-' + section.id + ' .loading-img');
            loadingIcon.removeClass('imgone');

            $.get(`${coreapiURL}/v1/requests/portal/section/loadmore/${section.id}/${section.loadMoreSegment}`, function (data) {
                try {
                    var ls = clampList(data);
                    section.requests = section.requests.concat(ls);
                    section.loadMoreSegment++;
                }
                catch(err) {
                    // pass
                    console.error(err);
                }
                showSuccessNotification(`Lọc thêm phản ánh nhóm [${section.ten}]: Xong!`, 2000);
                loadingIcon.addClass('imgone');
                //app.sections[index] = section;
                //var tmp = app.sections;
                //app.sections = tmp;
            });
        },
        viewDetail: function (pa) {
            this.detail = pa;
            $('#dlg-detail').modal('show');
            //$('#detail-tabs #detail-content-tab').tab('show');
            
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






