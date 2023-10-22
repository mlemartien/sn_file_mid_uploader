var JCL_FileUploader = Class.create();

// Note: MID user needs to have proper access to the table it wants to attach something too
// e.g. "import_admin" to attach to sys_data_source

JCL_FileUploader.prototype = {

    initialize: function() {

        // Set up the Packages references

        this.File = Packages.java.io.File;
        this.HttpClient = Packages.org.apache.commons.httpclient.HttpClient;
        this.UsernamePasswordCredentials = Packages.org.apache.commons.httpclient.UsernamePasswordCredentials;
        this.AuthScope = Packages.org.apache.commons.httpclient.auth.AuthScope;
        this.PostMethod = Packages.org.apache.commons.httpclient.methods.PostMethod;
        this.MultipartRequestEntity = Packages.org.apache.commons.httpclient.methods.multipart.MultipartRequestEntity;
        this.FilePart = Packages.org.apache.commons.httpclient.methods.multipart.FilePart;
        this.Part = Packages.org.apache.commons.httpclient.methods.multipart.Part;
        this.StringPart = Packages.org.apache.commons.httpclient.methods.multipart.StringPart;
        this.FileSystem = Packages.java.nio.file.FileSystems;

        // Get the parameters from the caller

        this.verbose = probe.getParameter('verbose');
        this.instance = probe.getParameter('instance');
        this.fileLocation = probe.getParameter('fileLocation');
        this.fileName = probe.getParameter('fileName');
        this.tableName = probe.getParameter('tableName');
        this.documentId = probe.getParameter('documentId');

		// Get the file path separator the Operating System uses

		this.osFilePathSeparator = this.FileSystem.getDefault().getSeparator();

    },

    midLog: function(message) {
        if (this.verbose == 'true') {
            ms.log('JCL_FileUploader | ' + message);
        }
    },
    
    execute: function() {

		// Status we'll put in the input ecc entry

		var result = 'SUCCESS';

        // Setting some base data to run this function

        var apiEndPoint = 'https://' + this.instance + '/api/now/attachment/upload';
        var localFileFullName = this.fileLocation + this.osFilePathSeparator + this.fileName;

		// Getting connection info from the MID server config file
  
        var apiUserName = ms.getConfigParameter('mid.instance.username');
        var apiUserPassword = ms.getConfigParameter('mid.instance.password');
		var useProxy = ms.getConfigParameter('mid.proxy.use_proxy');
		var proxyHost = ms.getConfigParameter('mid.proxy.host');
		var proxyPort = ms.getConfigParameter('mid.proxy.port');	    

        // Set up the HTTP Connection

        var client = new this.HttpClient();

        // Construct credentials

        var authScope = new this.AuthScope(this.instance, '443', null);
        var credentials = new this.UsernamePasswordCredentials(apiUserName, apiUserPassword);
        this.midLog('Using user ' + apiUserName + ' to connect to ' + apiEndPoint);
        client.getState().setCredentials(authScope, credentials);

		// Configure proxy if there is one configured in the MID server

		if (useProxy == 'true') {
			client.getHostConfiguration().setProxy(proxyHost, proxyPort);
		}

        // Create the POST REST request

        var post = new this.PostMethod(apiEndPoint);
        post.setDoAuthentication(true);

        // Construct parameters for the file to upload and the attachment destination

        var parts = [];
        parts.push(new this.StringPart('table_name', this.tableName));
        parts.push(new this.StringPart('table_sys_id', this.documentId));

        try {

            var file = new this.File(localFileFullName);
            if (file.exists()) {
                parts.push(new this.FilePart(file.getName(), file));
            }

        } catch (ex) {

            this.midLog('Error | Could not locate file ' + localFileFullName + '(' + ex.message + ')');
			result = 'FAILURE';
        }

        var entity = new this.MultipartRequestEntity(parts, post.getParams());
        post.setRequestEntity(entity);

        // Ready to execute the REST call

		this.midLog(JSON.stringify(result));
		
		if (result == 'SUCCESS') {

			try {

				postStatus = client.executeMethod(post);

				if (postStatus == 201) {
					this.midLog('Info | Successfully uploaded file ' + localFileFullName);
				} else {
					this.midLog('Error | Could not upload file ' + localFileFullName + '. Error http ' + postStatus);
				result = 'FAILURE';
				}

			} catch (ex) {

				this.midLog('Error | Could not upload file ' + localFileFullName + '. Exception occurred in posting: ' + ex.message);
				result = 'FAILURE';

			}
			
		}

		return result;

	},

    type: 'JCL_FileUploader'
};
