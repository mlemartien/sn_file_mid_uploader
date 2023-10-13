(function() {

    // Create a probe to be sent to the MID Server

    var jspr = new JavascriptProbe('M le Martien MID 1');

    // Configure which MID Server Script Include and function to call

    jspr.setName('JCL_FileUploader');
    jspr.setJavascript('var fu = new JCL_FileUploader(); res = fu.execute();');

    // Add the parameters that the MID Server will use
    
    jspr.addParameter('verbose', 'true');
    jspr.addParameter('instance', 'dev68475.service-now.com')
    jspr.addParameter('tableName', 'sys_data_source');
    jspr.addParameter('documentId', 'b3fa22432f932010ab05e36ef699b6bc');
    jspr.addParameter('fileLocation', '/servicenow/mlemartien_mid1/agent/upload');
    jspr.addParameter('fileName', 'users.csv');

    // Send the request to the MID Server

    jspr.create();

}();
