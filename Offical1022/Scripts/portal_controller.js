var portalController = {
    loadSomeLatestRequests: function (app) {
        app.sections = [];
        $.get(`${coreapiURL}/v1/requests/portal/latest/sections`, function (data) {
            var ls = clampList(data);
            ls.map(function (s) {
                s.loadMoreSegment = 0;
                s.requests = [];
            });
            app.sections = ls;
            app.sections.map(function (sec, index) {
                portalController.loadMoreSection(app, sec, index);
            });
        });
    },
    loadMoreSection: function (app, section, index) {
        var loadingIcon = $('.dspa-loading-img');
        loadingIcon.removeClass('imgone');

        $.get(`${coreapiURL}/v1/requests/portal/section/loadmore/${section.id}/${section.loadMoreSegment}`, function (data) {
            try {
                var ls = clampList(data);
                section.requests = section.requests.concat(ls);
                section.loadMoreSegment++;
            }
            catch (err) {
                console.error(err);
            }
            //showSuccessNotification(`Lọc thêm phản ánh nhóm [${section.ten}]: Xong!`, 2000);
            loadingIcon.addClass('imgone');

            if (index === 0) {
                var activeTabs = $('#dspa-tabs .nav-link.active');
                if (activeTabs.length === 0) {
                    $('#dspa-tabs .nav-item:first-child .nav-link').addClass('active');
                    portalController.dspa_switchTab(app, app.sections[0], 0);
                }
            }
        });
    },
    dspa_switchTab: function (app, section, index) {
        app.curSection = section;
        app.curSectionIndex = index;
    },
    showDetail: function (app, pa) {
        app.detail = pa;
        $('#dlg-detail').modal('show');
        //$('#detail-tabs #detail-content-tab').tab('show');
    },
    coKQTL: function (pa) {
        if (pa.kqtl === null || typeof pa.kqtl === 'undefined') return false;
        return pa.kqtl.length > 3;
    },
};