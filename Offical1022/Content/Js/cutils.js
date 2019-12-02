if (typeof (String.prototype.trim) === "undefined") {
    String.prototype.trim = function () {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

if (typeof (String.prototype.replaceAll) === "undefined") {
    String.prototype.replaceAll = function (search, replacement) {
        var target = this;
        return target.split(search).join(replacement);
    };
}

function showPleaseWaitDialog(titleText, messageText) {
    var dlg = $('#dlg-plswait');
    var title = dlg.find('.dlg-plswait-title');
    var msg = dlg.find('.dlg-plswait-msg');
    title.text(titleText);
    msg.text(messageText);

    dlg.modal({
        backdrop: 'static',
        keyboard: false
    });
}

function closePleaseWaitDialog() {
    var dlg = $('#dlg-plswait');
    dlg.modal('hide');
}

function closeMessageBox() {
    var dlg = $('#dlg-msgbox');
    dlg.modal('hide');
}

function showMessageBoxDialog(titleText, messageHTML, onConfirmHandler = null) {
    var dlg = $('#dlg-msgbox');
    var title = dlg.find('.dlg-msgbox-title');
    var msg = dlg.find('.dlg-msgbox-msg');
    title.text(titleText);
    msg.empty();
    msg.append(messageHTML);

    var btn = dlg.find('.btn-confirm');
    btn.unbind();
    if (onConfirmHandler !== null) {
        btn.on('click', onConfirmHandler);
    }
    dlg.modal({
        backdrop: 'static',
        keyboard: false
    });
}

function closeConfirmDialog() {
    var dlg = $('#dlg-confirm');
    dlg.modal('hide');
}

function showConfirmDialog(titleText, messageHTML, onConfirm, showConfirmCmd=false, requireReason=false, reasonList=null, confirmCode='OK') {
    var dlg = $('#dlg-confirm');
    var title = dlg.find('.dlg-confirm-title');
    var msg = dlg.find('.dlg-confirm-msg');
    var confirmCmdInp = dlg.find('.confirm-cmd-panel .inp-confirm-cmd');
    var reasonPanel = dlg.find('.reason-panel');
    var confirmCmdPanel = dlg.find('.confirm-cmd-panel');

    title.text(titleText);
    msg.empty();
    msg.append(messageHTML);

    if (showConfirmCmd) {
        confirmCmdPanel.removeClass('imgone');
        confirmCmdInp.val('');
    } else {
        confirmCmdPanel.addClass('imgone');
    }

    if (requireReason) {
        var txtReason = reasonPanel.find('.inp-reason');
        if (reasonList !== null) {
            var selectReason = reasonPanel.find('.confirm-reason-combobox');
            selectReason.removeClass('imgone');
            selectReason.empty();
            reasonList.map(function (r) {
                var opt = `<option value="${r[0]}">${r[1]}</option>`;
                selectReason.append(opt);
            });
        } else {
            txtReason.removeClass('imgone');
            txtReason.val('');
        }
        reasonPanel.removeClass('imgone');
    } else {
        reasonPanel.addClass('imgone');
    }

    var btnOK = dlg.find('#dlg-confirm-btn-ok');
    var codeMsg = $('.confirm-cmd-panel #confirm-code-msg');
    if (confirmCode !== 'ok') {
        codeMsg.empty();
        codeMsg.append('Mã xác nhận: <b>' + confirmCode + '</b>');
    }
    btnOK.off('click');
    btnOK.on('click', function () {
        var callbackData = {};
        if (requireReason) {
            if (reasonList !== null) {
                var selectReason = reasonPanel.find('.confirm-reason-combobox');
                callbackData['reason_id'] = selectReason.val();
            } else {
                var txtReason = reasonPanel.find('.inp-reason');
                callbackData['reason'] = txtReason.val();
            }
            console.log('reason: ');
        }
        if (showConfirmCmd) {
            var inpval = `${confirmCmdInp.val()}`;
            if (inpval.toLowerCase() === (''+confirmCode).toLowerCase()) {
                closeConfirmDialog();
                onConfirm(callbackData);
            }
            confirmCmdInp.focus();
            confirmCmdInp.select();
            return;
        }
        closeConfirmDialog();
        onConfirm(callbackData);
    });

    dlg.modal({
        backdrop: 'static',
        keyboard: false
    });
}

function b64EncodeUnicode(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
}

function tableToExcel(table, name, filename) {
    let uri = 'data:application/vnd.ms-excel;base64,',
        template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><title></title><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>',
        base64 = function (s) { return b64EncodeUnicode(decodeURIComponent(encodeURIComponent(s))) }, format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }

    if (!table.nodeType) table = document.getElementById(table);
    var ctx = { worksheet: name || 'Worksheet', table: table.innerHTML };

    var link = document.createElement('a');
    link.download = filename;
    link.href = uri + base64(format(template, ctx));
    link.click();
}

function objectEditorHideButtonSave() {
    var dlg = $('#dlg-obj-editor');
    var btnOK = dlg.find('.js-btn-ok');
    btnOK.addClass('fade');
}

function closeObjectEditorDialog() {
    var dlg = $('#dlg-obj-editor');
    dlg.modal('hide');
}

function showObjectEditor(model, onConfirm) {
    var dlg = $('#dlg-obj-editor');
    var title = dlg.find('.dlg-title');
    var bodyTop = dlg.find('.mbody-top');
    var bodyMid = dlg.find('.mbody-mid');
    title.text(model.title);
    bodyTop.empty();
    bodyMid.empty();

    if ('msgTop' in model) {
        bodyTop.append(model.msgTop);
    }

    var html = '';
    for (var i in model.fields) {
        var f = model.fields[i];
        if ('type' in f) {
            //TODO: implement checkbox
            if (f.type === 'picklist') {
                html += `<div><label>${f.caption}</label></div>`;
                html += '<div class="modal-picklist big">' +
                    '<ul class="list-group">';
                for (var k in f.src) {
                    var item = f.src[k];
                    var itemid = item[f.key_id];
                    var itemtext = item[f.key_text];
                    html += `<li class="list-group-item" itemid="${itemid}">`;
                    if (itemid in f.selectedids) {
                        html += `  <input type="checkbox" checked/>`;
                    } else {
                        html += `  <input type="checkbox"/>`;
                    }
                    html += `${itemtext}</li >`;
                }
                continue;
            } else if (f.type === 'textbox') {
                html +=
                    `<div class="input-group">` +
                    `    <div class="input-group-addon">${f.caption}</div>` +
                    `    <input type="text" class="form-control" id="${f.id}" value="${f.value}" placeholder="${f.placeholder}"/>` +
                    `</div>`;
            }
        }
        
    }
    bodyMid.append(html);

    var btnOK = dlg.find('.js-btn-ok');
    btnOK.removeClass('fade');
    btnOK.off('click');
    btnOK.on('click', function () {
        var fields = {};
        for (var i in model.fields) {
            var f = model.fields[i];
            var inp = dlg.find(`#${f.id}`);
            fields[f.id] = inp.val();
        }
        onConfirm(fields);
    });
    if ('btnConfirmCaption' in model) {
        btnOK.text(model.btnConfirmCaption);
    } 

    dlg.modal({
        backdrop: 'static',
        keyboard: false
    });
}


function showSuccessNotification(msg, delay = 2000) {
    showNotification('success', msg, delay);
}

function showErrorNotification(msg, delay = 2000) {
    showNotification('error', msg, delay);
}

function showWarningNotification(msg, delay = 2000) {
    showNotification('warn', msg, delay);
}
function showNotification(type, msg, delay = 2000) {
    $.notify(msg, {
        className: type,
        globalPosition: 'top right',
        clickToHide: true,
        autoHide: true,
        autoHideDelay: delay,
        hideAnimation: "fadeOut",
        arrowShow: true,
        arrowSize: 5
    });
}


function clampText(text, maxLength) {
    if (text === null || text === undefined) return '';
    if (text.length > maxLength) return text.substring(0, maxLength) + '...';
    return text;
}


function clampList(data) {
    var ls = data;
    if (typeof data === 'string' || data instanceof String)
        ls = JSON.parse(data);
    else if (data === null || typeof data === 'undefined')
        return [];
    return ls;
}

function clampObject(data) {
    var obj = data;
    if (typeof data === 'string' || data instanceof String)
        obj = JSON.parse(data);
    return obj;
}

function clampText(text, maxLength) {
    if (text === null || text === undefined) return '';
    if (text.length > maxLength) return text.substring(0, maxLength - 1) + '...';
    return text;
}

function renderMultilineText(text) {
    if (text === null || typeof text === 'undefined') return '';
    var htmlLines = text.replace(/\n/g, '<br/>');
    return htmlLines;
}

