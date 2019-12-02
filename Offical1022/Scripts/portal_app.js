
var app = new Vue({
    el: '#app-portal',
    data: function () {
        return {
            listPhuong: [],
            listHuyen: [],
            listDonVi: [],
            listLinhVuc: [],
            hoten: '',
            sdt: '',
            email: '',
            diachi: '',
            noidung: '',
            curHuyen: 0,
            curPhuong: 0,
            curDonVi: 0,
            curLinhVuc: 0,
            searchphone: '',
            searchcode: '',
            dataLoaded: false,
            detail: {},
            latestList5: [],
            sections: [],
            curSection: null,
            curSectionIndex: 0
        };
    },
    mounted: function () {
        this.getListDVHC();
        this.reloadLatestList();
        portalController.loadSomeLatestRequests(this);
    },
    methods: {
        dspa_switchTab: function (section, index) {
            portalController.dspa_switchTab(this, section, index);
        },
        showDetail: function (pa) {
            portalController.showDetail(this, pa);
        },
        loadMoreCurrentSection: function () {
            portalController.loadMoreSection(this, this.curSection, this.curSectionIndex);
        },
        reloadLatestList: function () {
            $.get(`${coreapiURL}/v1/requests/portal/latest/acceptedlist`, function (data) {
                var ls = clampList(data);
                ls.map(item => {
                    item.summary = clampText(item.content, 150);
                });
                app.latestList5 = ls;
            });
        },
        getSummaryText: function (text) {
            if (text.length > 50)
                return text.substr(0, 50) + '...';
            return text;
        },
        getListDVHC: function () {
            $.get(`${buildinWsUrl}listDistrict`, function (data) {
                app.listHuyen = clampList(data);
                app.curHuyen = 0;
                app.dataLoaded = true;
            });
        },
        verifyBeforeSearch: function () {
            this.searchcode = this.searchcode.trim();
            this.searchphone = this.searchphone.trim();
            if (this.searchcode.length < 11 || this.searchcode.indexOf(' ') !== -1) {
                showMessageBoxDialog('Thông báo', `Mã phản ánh không hợp lệ: "${this.searchcode}", xin kiểm tra lại!`);
                return;
            }
            if (this.searchphone.length < 10 || this.searchphone.indexOf(' ') !== -1) {
                showMessageBoxDialog('Thông báo', `SĐT này không hợp lệ: "${this.searchphone}", xin kiểm tra lại!`);
                return;
            }
            //showConfirmDialog('Tìm kiếm', `Bạn hãy nhập mã xác nhận bên dưới để bắt đầu tìm kiếm.`, function () {
            //    app.doSearch();
            //}, true, requireReason = false, reasonList=null, confirmCode = confirmCode);
            this.doSearch();
        },
        doSearch: function () {
            showPleaseWaitDialog('Tìm kiếm', 'Đang tìm phản ánh, xin chờ giây lát...');
            $.post(
                `${coreapiURL}/v1/requests/portal/search/phoneandcode`
                //`${buildinWsUrl}search`
                ,JSON.stringify( { sdt: this.searchphone, code: this.searchcode } ),
                function (data) {
                    closePleaseWaitDialog();
                    if ( data === "null" || data === null || data === undefined) {
                        showMessageBoxDialog('Thông báo', 'Không tìm thấy phản ánh có mã: ' + app.searchcode + ' và SĐT: ' + app.searchphone);
                    } else {
                        var obj = clampObject(data);
                        if (obj === null || typeof obj === 'undefined') {
                            showErrorNotification('Lỗi: không tìm thấy thông tin của phản ánh');
                            return;
                        }
                        app.showDetail(obj);
                    }
                }
            )
                .fail(function (xhr, status, error) {
                    closePleaseWaitDialog();
                    showMessageBoxDialog('Thông báo', 'Không tìm thấy phản ánh có mã: ' + app.searchcode + ' và SĐT: ' + app.searchphone);
                })
            ;
        },
        onChangeDistrict: function () {
            $.get(`${buildinWsUrl}listWardByDistrict`,
                { districtId: app.curHuyen },
                function (data) {
                    app.listPhuong = clampList(data);
                    app.curPhuong = 0;
                }
            );
        },
        prepareNew: function () {
            window.location.reload();
        },
        guiPhanAnh: function () {
            showPleaseWaitDialog('Gửi phản ánh', 'Đang lưu lên hệ thống, xin chờ giây lát...');
            var postData = {
                displayName: this.hoten,
                email: this.email,
                phoneNumber: this.sdt,
                address: this.diachi,
                addressDistrict: this.curHuyen,
                addressWard: this.curPhuong,
                content: this.noidung
            };

            $.post(`${buildinWsUrl}createRequest`,
                postData,
                function (data) {
                    closePleaseWaitDialog();
                    showMessageBoxDialog('Thông báo', 'Đã lưu phản ánh lên hệ thống, bạn sẽ nhận được tin nhắn khi phản ánh của bạn được chuyên viên 1022 tiếp nhận.',
                        function () {
                            window.location.reload();
                        });
                }
            );
        },
        verifyCaptchaToken: function (token) {
            console.warn(' verify token ' + token);
            $.post("/portal/verifyCaptcha",
                {
                    token: token
                },
                function (result) {
                    console.log(result);
                    $('#dbg').text(`token: ${token}   result ${result}`);
                    //if (data.success) {
                    //    closePleaseWaitDialog();
                    //    //app.guiPhanAnh();
                    //} else {
                    //    closePleaseWaitDialog();
                    //}

                }
            );

            //$.post("https://www.google.com/recaptcha/api/siteverify",
            //    {
            //        secret: recaptcha_v3_public_key,
            //        response: token
            //    },
            //    function (data) {
            //        console.log(data);
            //        $('#dbg').text(`token: ${token}   data ${data}`);
            //        if (data.success) {
            //            closePleaseWaitDialog();
            //            //app.guiPhanAnh();
            //        } else {
            //            closePleaseWaitDialog();
            //        }

            //    }
            //);
        },
        testCaptcha: function () {
            grecaptcha.ready(function () {
                grecaptcha.execute(recaptcha_v3_public_key, { action: 'submit_request' }).then(function (token) {
                    app.verifyCaptchaToken(token);
                });
            });
        },
        checkBeforeUpload: function () {
            this.hoten = this.hoten.trim();
            this.email = this.email.trim();
            this.sdt = this.sdt.trim();
            this.diachi = this.diachi.trim();
            this.noidung = this.noidung.trim();
            //if (this.hoten.length < 3) {
            //    showMessageBoxDialog('Thiếu thông tin', 'Họ tên không hợp lệ (ít nhất 3 ký tự)!');
            //    return;
            //}
            //if (this.hoten.length > 250) {
            //    showMessageBoxDialog('Thiếu thông tin', 'Họ tên không hợp lệ (nhiều nhất 250 ký tự)!');
            //    return;
            //}
            if (this.noidung.length < 50) {
                showMessageBoxDialog('Thiếu thông tin', 'Nội dung phản ánh không hợp lệ(ít nhất 50 ký tự)!');
                return;
            }
            if (this.noidung.length > 4000) {
                showMessageBoxDialog('Thiếu thông tin', 'Nội dung phản ánh không hợp lệ(nhiều nhất 4000 ký tự)!');
                return;
            }
            if (this.sdt.length < 9) {
                showMessageBoxDialog('Thiếu thông tin', 'Số điện thoại liên hệ không hợp lệ ( ít nhất 9 chữ số )!');
                return;
            }
            if (this.sdt.length > 12) {
                showMessageBoxDialog('Thiếu thông tin', 'Số điện thoại liên hệ không hợp lệ ( nhiều nhất 12 chữ số )!');
                return;
            }
            //if (this.email.length > 0 && this.email.indexOf('@') === -1) {
            //    showMessageBoxDialog('Thiếu thông tin', 'Địa chỉ thư điện tử không hợp lệ!');
            //    return;
            //}
            //if (this.diachi.length < 10) {
            //    showMessageBoxDialog('Thiếu thông tin', 'Địa chỉ không hợp lệ (ít nhất 10 ký tự)!');
            //    return;
            //}
            //if (this.diachi.length < 10) {
            //    showMessageBoxDialog('Thiếu thông tin', 'Địa chỉ không hợp lệ (ít nhất 10 ký tự)!');
            //    return;
            //}

            this.testCaptcha();
            //showPleaseWaitDialog('Kiểm tra dữ liệu', 'Xin chờ giây lát...');
            //grecaptcha.ready(function () {
            //    grecaptcha.execute('6LfGCZkUAAAAAJughDeAToVSshS7gd3flcS8v5x-', { action: 'submit_request' }).then(function (token) {
            //        app.verifyCaptchaToken(token);
            //    });
            //});
            
            showConfirmDialog('Gửi phản ánh', `Bạn hãy nhập mã xác nhận bên dưới để bắt đầu cập nhật lên hệ thống.`, function () {
                app.guiPhanAnh();
            }, true, requireReason = false, reasonList = null, confirmCode = confirmCode);
        }
    },
    computed: {
        widescreen: function () {
            return $(window).width() >= 840;
        },
    }
});


Vue.filter('formatDate', function (value) {
    if (value) {
        return moment(String(value)).format('DD/MM/YYYY HH:mm:ss');
    }
});



