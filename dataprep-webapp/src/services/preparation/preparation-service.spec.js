/*jshint camelcase: false */

describe('Preparation Service', function () {
    'use strict';

    var preparationConsolidation, datasetConsolidation;
    var datasets = [{name: 'my dataset'}, {name: 'my second dataset'}, {name: 'my second dataset (1)'}, {name: 'my second dataset (2)'}];
    var preparations = [{id: '4385fa764bce39593a405d91bc88'}, {id: '58444bce39593a405d9456'}, {id: '2545764bce39593a405d91bc8673'}];
    var newPreparationId = '6cd546546548a745';

    beforeEach(module('data-prep.services.preparation'));

    beforeEach(inject(function($q, DatasetListService, PreparationListService, PreparationRestService) {
        preparationConsolidation = $q.when(true);
        datasetConsolidation = $q.when(datasets);

        spyOn(DatasetListService, 'refreshDefaultPreparation').and.returnValue(datasetConsolidation);
        spyOn(PreparationListService, 'refreshMetadataInfos').and.returnValue(preparationConsolidation);

        spyOn(PreparationListService, 'refreshPreparations').and.returnValue($q.when(preparations));
        spyOn(PreparationListService, 'create').and.returnValue($q.when({data: newPreparationId}));
        spyOn(PreparationListService, 'update').and.returnValue($q.when(true));
        spyOn(PreparationListService, 'delete').and.returnValue($q.when(true));

        spyOn(PreparationRestService, 'updateStep').and.returnValue($q.when(true));
        spyOn(PreparationRestService, 'getContent').and.returnValue($q.when(true));
        spyOn(PreparationRestService, 'getDetails').and.returnValue($q.when(true));
        spyOn(PreparationRestService, 'getPreviewDiff').and.returnValue($q.when(true));
        spyOn(PreparationRestService, 'getPreviewUpdate').and.returnValue($q.when(true));
        spyOn(PreparationRestService, 'getPreviewAdd').and.returnValue($q.when(true));
    }));

    describe('getter/refresher', function() {
        it('should return preparation list from ListService', inject(function (PreparationService, PreparationListService) {
            //given
            PreparationListService.preparations = preparations;

            //when
            var result = PreparationService.preparationsList();

            //then
            expect(result).toBe(preparations);
        }));

        it('should refresh preparations', inject(function ($rootScope, PreparationService, PreparationListService) {
            //when
            PreparationService.refreshPreparations();
            $rootScope.$digest();

            //then
            expect(PreparationListService.refreshPreparations).toHaveBeenCalled();
        }));

        it('should return a promise resolving preparations', inject(function ($rootScope, PreparationService) {
            //given
            var result = null;

            //when
            PreparationService.refreshPreparations()
                .then(function(promiseResult) {
                    result = promiseResult;
                });
            $rootScope.$digest();

            //then
            expect(result).toBe(preparations);
        }));

        it('should consolidate preparations and datasets on refresh', inject(function ($rootScope, PreparationService, PreparationListService, DatasetListService) {
            //when
            PreparationService.refreshPreparations();
            PreparationListService.preparations = preparations; //simulate preparations list update
            $rootScope.$digest();

            //then
            expect(DatasetListService.refreshDefaultPreparation).toHaveBeenCalledWith(preparations);
            expect(PreparationListService.refreshMetadataInfos).toHaveBeenCalledWith(datasets);
        }));

        it('should not refresh but return a promise resolving existing preparations if they are already fetched', inject(function ($rootScope, PreparationService, PreparationListService) {
            //given
            PreparationListService.preparations = preparations;
            var result = null;

            //when
            PreparationService.getPreparations()
                .then(function(promiseResult) {
                    result = promiseResult;
                });
            $rootScope.$digest();

            //then
            expect(result).toBe(preparations);
        }));

        it('should not consolidate preparations and datasets when preparations has not been fetched', inject(function ($rootScope, PreparationService, PreparationListService, DatasetListService) {
            //given
            PreparationListService.preparations = preparations;

            //when
            PreparationService.getPreparations();
            $rootScope.$digest();

            //then
            expect(DatasetListService.refreshDefaultPreparation).not.toHaveBeenCalled();
            expect(PreparationListService.refreshMetadataInfos).not.toHaveBeenCalled();
        }));

        it('should fetch preparations if they are not already fetched', inject(function ($rootScope, PreparationService, PreparationListService) {
            //given
            PreparationListService.preparations = null;
            var result = null;

            //when
            PreparationService.getPreparations()
                .then(function(promiseResult) {
                    result = promiseResult;
                });
            $rootScope.$digest();

            //then
            expect(result).toBe(preparations);
        }));

        it('should consolidate preparations and datasets on refresh', inject(function ($rootScope, PreparationService, PreparationListService, DatasetListService) {
            //given
            PreparationListService.preparations = null;

            //when
            PreparationService.getPreparations();
            PreparationListService.preparations = preparations; //simulate preparations update
            $rootScope.$digest();

            //then
            expect(DatasetListService.refreshDefaultPreparation).toHaveBeenCalledWith(preparations);
            expect(PreparationListService.refreshMetadataInfos).toHaveBeenCalledWith(datasets);
        }));
    });

    describe('details/content', function() {
        it('should get current preparation content from ListService', inject(function ($rootScope, PreparationService, PreparationRestService) {
            //given
            var version = 'head';
            var preparationId = '4385fa764bce39593a405d91bc88';

            //when
            PreparationService.getContent(preparationId, version);
            $rootScope.$digest();

            //then
            expect(PreparationRestService.getContent).toHaveBeenCalledWith(preparationId, version);
        }));

        it('should get current preparation details from ListService', inject(function ($rootScope, PreparationService, PreparationRestService) {
            //given
            var preparationId = '4385fa764bce39593a405d91bc88';

            //when
            PreparationService.getDetails(preparationId);
            $rootScope.$digest();

            //then
            expect(PreparationRestService.getDetails).toHaveBeenCalledWith(preparationId);
        }));
    });

    describe('lifecycle', function() {
        it('should create a new preparation', inject(function ($rootScope, PreparationService, PreparationListService) {
            //given
            var datasetId = '2430e5df845ab6034c85';
            var name = 'my preparation';

            //when
            PreparationService.create(datasetId, name);
            $rootScope.$digest();

            //then
            expect(PreparationListService.create).toHaveBeenCalledWith(datasetId, name);
        }));

        it('should consolidate preparations and datasets on creation', inject(function ($rootScope, PreparationService, PreparationListService, DatasetListService) {
            //given
            PreparationListService.preparations = preparations;
            var datasetId = '2430e5df845ab6034c85';

            //when
            PreparationService.create(datasetId, 'my preparation');
            $rootScope.$digest();

            //then
            expect(DatasetListService.refreshDefaultPreparation).toHaveBeenCalledWith(preparations);
            expect(PreparationListService.refreshMetadataInfos).toHaveBeenCalledWith(datasets);
        }));

        it('should update current preparation name', inject(function ($rootScope, PreparationService, PreparationListService) {
            //given
            var preparationId = '6cd546546548a745';
            var name = 'my preparation';

            //when
            PreparationService.setName(preparationId, name);
            $rootScope.$digest();

            //then
            expect(PreparationListService.update).toHaveBeenCalledWith(preparationId, name);
        }));

        it('should consolidate preparations and datasets on name update', inject(function ($rootScope, PreparationService, PreparationListService, DatasetListService) {
            //given
            PreparationListService.preparations = preparations;
            var preparationId = '6cd546546548a745';
            var name = 'my preparation';

            //when
            PreparationService.setName(preparationId, name);
            $rootScope.$digest();

            //then
            expect(DatasetListService.refreshDefaultPreparation).toHaveBeenCalledWith(preparations);
            expect(PreparationListService.refreshMetadataInfos).toHaveBeenCalledWith(datasets);
        }));

        it('should delete a preparation', inject(function ($rootScope, PreparationService, PreparationListService) {
            //when
            PreparationService.delete(preparations[0]);
            $rootScope.$digest();

            //then
            expect(PreparationListService.delete).toHaveBeenCalledWith(preparations[0]);
        }));

        it('should consolidate preparations and datasets on deletion', inject(function ($rootScope, PreparationService, PreparationListService, DatasetListService) {
            //given
            PreparationListService.preparations = preparations;

            //when
            PreparationService.delete(preparations[0]);
            $rootScope.$digest();

            //then
            expect(DatasetListService.refreshDefaultPreparation).toHaveBeenCalledWith(preparations);
            expect(PreparationListService.refreshMetadataInfos).toHaveBeenCalledWith(datasets);
        }));
    });

    describe('steps', function() {
        it('should copy implicit parameters when they are in original params', inject(function(PreparationService) {
            //given
            var newParams = {value: 'tata'};
            var oldParams = {value: 'toto', scope: 'cell', column_id: '0001', row_id: '256', column_name: 'state'};

            //when
            PreparationService.copyImplicitParameters(newParams, oldParams);

            //then
            expect(newParams).toEqual({value: 'tata', scope: 'cell', column_id: '0001', row_id: '256', column_name: 'state'});
        }));

        it('should NOT copy implicit parameters when they are NOT in original params', inject(function(PreparationService) {
            //given
            var newParams = {value: 'tata'};
            var oldParams = {value: 'toto', scope: 'cell'};

            //when
            PreparationService.copyImplicitParameters(newParams, oldParams);

            //then
            expect(newParams).toEqual({value: 'tata', scope: 'cell'});
        }));

        it('should return true if the parameters are different', inject(function (PreparationService) {
            //given
            var step = {
                column: {
                    id: '1',
                    name: 'firstname'
                },
                actionParameters: {
                    parameters: {value: '--', column_name: 'firstname', column_id: '1'}
                }
            };
            var newParams = {value: '.'};

            //when
            var result = PreparationService.paramsHasChanged(step, newParams);

            //then
            expect(result).toBe(true);
        }));

        it('should return false if the parameters are the same', inject(function (PreparationService) {
            //given
            var step = {
                column: {
                    id: '1',
                    name: 'firstname'
                },
                actionParameters: {
                    parameters: {value: '--', column_id: '1', column_name: 'firstname'}
                }
            };
            var newParams = {value: '--', column_id: '1', column_name: 'firstname'};

            //when
            var result = PreparationService.paramsHasChanged(step, newParams);

            //then
            expect(result).toBe(false);
        }));

        it('should update a preparation step with provided parameters', inject(function ($rootScope, PreparationService, PreparationRestService) {
            //given
            var preparationId = '6cd546546548a745';
            var step = {
                transformation: {
                    stepId : '867654ab15edf576844c4',
                    name: 'deletematch'
                },
                column: {id: '1', name:'firstname'}
            };
            var parameters = {value: 'Toto', column_name: 'firstname', column_id: '1', scope: 'column'};

            //when
            PreparationService.updateStep(preparationId, step, parameters);
            $rootScope.$digest();

            //then
            expect(PreparationRestService.updateStep).toHaveBeenCalledWith(
                '6cd546546548a745', //prep id
                '867654ab15edf576844c4',  //step id
                {
                    action: 'deletematch', //step name
                    parameters: {value: 'Toto', column_name: 'firstname', column_id: '1', scope: 'column'} //params
                }
            );
        }));
    });

    describe('preview', function() {
        it('should get diff preview', inject(function ($q, PreparationService, PreparationRestService) {
            //given
            var preparationId = '6cd546546548a745';
            var currentStep = {id: '86574251524'};
            var previewStep = {id: '65487874887'};
            var recordsTdpId = [1,2,3];
            var canceler = $q.defer();

            //when
            PreparationService.getPreviewDiff(preparationId, currentStep, previewStep, recordsTdpId, canceler);

            //then
            expect(PreparationRestService.getPreviewDiff).toHaveBeenCalledWith(preparationId, currentStep, previewStep, recordsTdpId, canceler);
        }));

        it('should get diff preview', inject(function ($q, PreparationService, PreparationRestService) {
            //given
            var preparationId = '6cd546546548a745';
            var currentStep = {id: '86574251524'};
            var updateStep = {id: '65487874887'};
            var newParams = {value: 'toto'};
            var recordsTdpId = [1,2,3];
            var canceler = $q.defer();

            //when
            PreparationService.getPreviewUpdate(preparationId, currentStep, updateStep, newParams, recordsTdpId, canceler);

            //then
            expect(PreparationRestService.getPreviewUpdate).toHaveBeenCalledWith(preparationId, currentStep, updateStep, newParams, recordsTdpId, canceler);
        }));

        it('should get add preview', inject(function ($q, PreparationService, PreparationRestService) {
            //given
            var preparationId = '6cd546546548a745';
            var datasetId = '754a54654fd694e6464';
            var action = 'cut';
            var params = {value: 'toto'};
            var recordsTdpId = [1,2,3];
            var canceler = $q.defer();

            //when
            PreparationService.getPreviewAdd(preparationId, datasetId, action, params, recordsTdpId, canceler);

            //then
            expect(PreparationRestService.getPreviewAdd).toHaveBeenCalledWith(preparationId, datasetId, action, params, recordsTdpId, canceler);
        }));
    });

});