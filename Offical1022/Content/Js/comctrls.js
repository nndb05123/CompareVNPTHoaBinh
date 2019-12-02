function setupIPF_Checkbox() {
    var inpcbox = $('.ipf-cbox');
    inpcbox.on('click', function () {
        //console.log('toogle ' + inpcbox);
        var inp = inpcbox.find('input');
        var checked = inp.is(':checked');
        if (checked)
            inp.removeAttr('checked');
        else
            inp.attr('checked', 'checked');
    });
}



(function () {
    setupIPF_Checkbox();
    var bootstrapTooltip = $.fn.tooltip.noConflict();
    $.fn.bstooltip = bootstrapTooltip;
    $('.ipf-cbox').bstooltip();
    $('li').bstooltip();
})();