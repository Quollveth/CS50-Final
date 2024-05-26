import $ from 'jquery';

export const toggle_visibility = (element:JQuery<HTMLElement>):void => {
    if(element.hasClass('hidden')){
        element.removeClass('hidden');
        return;
    }
    element.addClass('hidden');
}