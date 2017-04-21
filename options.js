window.onload = function () {
    $('.select').each(function() {
        initializeCustomSelect($(this));
    });

    $('#changeLanguages').click(function () {
        let fromValue = $('#translateFrom').attr('data-value');
        let toValue = $('#translateTo').attr('data-value');
        let fromHtml = $('#translateFrom').children('.selected').children('span').html();
        let toHtml = $('#translateTo').children('.selected').children('span').html();
        $('#translateFrom').attr('data-value', toValue);
        $('#translateFrom').children('.selected').children('span').html(toHtml);
        $('#translateTo').attr('data-value', fromValue);
        $('#translateTo').children('.selected').children('span').html(fromHtml);
    });

    /* Set range style*/
    let thumbStyle = 'input[type="range"]::-webkit-slider-thumb{box-shadow:';
    let shadowSize = -6;
    let shadowColor = '#9d9d9d';
    let shadowWidth = $('.rangeWrapper').width();
    for (let i = 6; i <= shadowWidth; i++) {
        thumbStyle += i + 'px 0 0 ' + shadowSize + 'px ' + shadowColor;
        if (i != shadowWidth) {
            thumbStyle += ',';
        }
    }
    thumbStyle += ';}';
    $('head').append('<style>' + thumbStyle + '</style>');

    $('.rangeWrapper').each(function() {
        $(this).children('input[type=range]').on("change mousemove", function () {
            $(this).parent().children('.timeWrapper').children('.time').html($(this).val());
        }).mousemove();
    });
};

/**
 * Initialize custom select
 */
function initializeCustomSelect(select) {
    let selected = $(select).children('.selected');
    let options = $(select).children('.options');
    let selectedValue = select.attr('data-value');
    let selectedOption = $(options).children('[data-value = ' + selectedValue + ']');

    $(selected).children('span').html($(selectedOption).html());

    selected.click(function () {
        if (select.hasClass('active')) {
            options.addClass('hidden');
            select.removeClass('active');
        } else {
            options.removeClass('hidden');
            select.addClass('active');
        }
    });

    options.children('.option').each(function () {
        $(this).click(function () {
            $(select).attr('data-value', $(this).attr('data-value'));
            $(selected).children('span').html($(this).html());
            selected.click();

        })
    });
}