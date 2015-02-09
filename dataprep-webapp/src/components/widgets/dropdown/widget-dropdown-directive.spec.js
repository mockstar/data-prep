'use strict';

describe('Dropdown directive', function () {
    var scope, element, html;

    beforeEach(module('talend.widget'));
    beforeEach(module('htmlTemplates'));

    var clickDropdownToggle = function (elm) {
        elm = elm || element;
        elm.find('.dropdown-action').eq(0).click();
    };

    var clickDropdownItem = function (elm) {
        elm = elm || element;
        elm.find('a[role="menuitem"]').eq(0).click();
    };

    beforeEach(inject(function ($rootScope, $compile) {
        scope = $rootScope.$new();

        html = '<talend-dropdown id="dropdown1">' +
        '    <div class="dropdown-container grid-header">' +
        '        <div class="dropdown-action">' +
        '            <div class="grid-header-title dropdown-button">{{ column.id }}</div>' +
        '            <div class="grid-header-type">{{ column.type }}</div>' +
        '        </div>' +
        '        <ul class="dropdown-menu grid-header-menu" style="display:none;">' +
        '            <li role="presentation"><a role="menuitem" href="#">Hide Column</a></li>' +
        '            <li class="divider"></li>' +
        '            <li role="presentation"><a role="menuitem" href="#">Split first Space</a></li>' +
        '            <li role="presentation"><a role="menuitem" href="#">Uppercase</a></li>' +
        '        </ul>' +
        '    </div>' +
        '</talend-dropdown>';
        element = $compile(html)(scope);
        scope.$digest();
    }));

    it('should show dropdown-menu on dropdown-action click', function () {
        //given
        var menu = element.find('.dropdown-menu').eq(0);
        expect(menu.hasClass('show-menu')).toBe(false);

        //when
        clickDropdownToggle();

        //then
        expect(menu.hasClass('show-menu')).toBe(true);
    });

    it('should show dropdown-menu on dropdown-action click when menu is visible', function () {
        //given
        var menu = element.find('.dropdown-menu').eq(0);
        clickDropdownToggle();
        expect(menu.hasClass('show-menu')).toBe(true);

        //when
        clickDropdownToggle();

        //then
        expect(menu.hasClass('show-menu')).toBe(false);
    });

    it('should hide dropdown-menu on item click', function () {
        //given
        var menu = element.find('.dropdown-menu').eq(0);
        clickDropdownToggle();
        expect(menu.hasClass('show-menu')).toBe(true);

        //when
        clickDropdownItem();

        //then
        expect(menu.hasClass('show-menu')).toBe(false);
    });

    it('should hide dropdown-menu on body click', function () {
        //given
        var menu = element.find('.dropdown-menu').eq(0);

        clickDropdownToggle();
        expect(menu.hasClass('show-menu')).toBe(true);

        //when
        angular.element('body').click();

        //then
        expect(menu.hasClass('show-menu')).toBe(false);
    });

});