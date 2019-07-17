#! -*- coding: utf-8 -*-

##    Description    Flame web-service
##
##    Authors:       Marc Serret i Garcia (marcserret@live.com)
##
##    Copyright 2018 Marc Serret i Garcia
##
##    This file is part of Flame
##
##    Flame is free software: you can redistribute it and/or modify
##    it under the terms of the GNU General Public License as published by
##    the Free Software Foundation version 3.
##
##    Flame is distributed in the hope that it will be useful,
##    but WITHOUT ANY WARRANTY; without even the implied warranty of
##    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
##    GNU General Public License for more details.
##
##    You should have received a copy of the GNU General Public License
##    along with Flame. If not, see <http://www.gnu.org/licenses/>.

import os
import sys
import shutil
import tempfile
import json
import re
from pathlib import Path

import cherrypy
from cherrypy.lib.static import serve_file


from flame import smanage
from flame import context
from flame import search
# from flame import utils 

def numeric_version (text_version):
    version=0
    if text_version[:3]=='ver': 
        version = int(text_version[-6:]) ## get the numbers
    return version


class FlameSearch(object):
    @cherrypy.expose
    def index(self):
        return open('./templates/index.html')
        # return open(os.path.split(os.path.realpath(__file__))[0]+ '/templates/index.html') TODO: Make it works

    @cherrypy.expose
    def upload(self):

        filename = os.path.basename(cherrypy.request.headers['x-filename'])
        temp_dir = os.path.basename(cherrypy.request.headers['temp-dir'])

        if temp_dir != '':
            path = os.path.join(tempfile.gettempdir(),temp_dir)
            os.mkdir (path)
        else:
            path = tempfile.gettempdir()
            # path = './'
        
        destination = os.path.join(path, filename)
        
        with open(destination, 'wb') as f:
            shutil.copyfileobj(cherrypy.request.body, f)

@cherrypy.expose
class FlameSearchWS(object):
    @cherrypy.tools.accept(media='text/plain')

    def POST(self, ifile, space, version, temp_dir):
        
        ifile = os.path.join(tempfile.gettempdir(),temp_dir,ifile)

        # TODO: for now, only working for plain spaces (no external input sources)          
        space = {'space' : space,
                 'version' : numeric_version(version),
                 'infile' : ifile,
                 'runtime_param':None}
        success, results = context.search_cmd(space, 'JSON')
        # print(space, success, results)
        
        return results

@cherrypy.expose
class FlameAddspace(object):
    @cherrypy.tools.accept(media='text/plain')
    def POST(self, space):
        if re.match('^[\w-]+$', space):
            result = smanage.action_new(space)
            return str(result[1])
        else:
            return "Non alphanumeric character detected. Aborting operation"

@cherrypy.expose
class FlameExportspace(object):
    @cherrypy.tools.accept(media='text/plain')
    def GET(self, space):
        result = smanage.action_export(space)
        return "true"

@cherrypy.expose
class Download(object):
    @cherrypy.tools.accept(media='text/plain')
    def GET(self, space):
        return cherrypy.lib.static.serve_file(os.path.abspath(space+".tgz"), "application/gzip", "attachment")

@cherrypy.expose
class FlameDeleteFamily(object):
    @cherrypy.tools.accept(media='text/plain')
    def POST(self, space):
        result = smanage.action_kill(space)
        return str(result[1])

@cherrypy.expose
class FlameDeleteVersion(object):
    @cherrypy.tools.accept(media='text/plain')
    def POST(self, space, version):
        result = smanage.action_remove(space, numeric_version(version))
        return str(result[1])

@cherrypy.expose
class FlameClonespace(object):
    @cherrypy.tools.accept(media='text/plain')
    def POST(self, space):
        result = smanage.action_publish(space)
        return str(result[1])

@cherrypy.expose
class FlameImportspace(object):
    @cherrypy.tools.accept(media='text/plain')
    def POST(self, space):
        space = os.path.join(tempfile.gettempdir(),space)
        result = smanage.action_import(space)
        return result

@cherrypy.expose
class FlameInfoWS(object):
    @cherrypy.tools.accept(media='text/plain')
    def GET(self):
        config_data = utils._read_configuration()
        data = { "provider": config_data['provider'],
                 "homepage": config_data['homepage'],
                 "admin_name": config_data['admin_name'],
                 "admin_email": config_data['admin_email']
                }   
        return json.dumps(data)

@cherrypy.expose
class FlamespaceInfo(object):
    @cherrypy.tools.accept(media='text/plain')
    def POST(self, space, version, output):
        result = smanage.action_info(space, numeric_version(version), output)
        return result[1]

@cherrypy.expose
class FlameDirWS(object):
    @cherrypy.tools.accept(media='text/plain')
    def GET(self):

        success, results = smanage.action_dir()
        #print(results)

        if not success:
            return "no space found"
        return results

if __name__ == '__main__':
    conf = {
        '/': {
            'tools.sessions.on': False,
            'tools.staticdir.root': os.path.abspath(os.getcwd())
        },
        '/info': {
            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
            'tools.response_headers.on': True,
            'tools.response_headers.headers': [('Content-Type', 'text/plain')]
        },
        '/dir': {
            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
            'tools.response_headers.on': True,
            'tools.response_headers.headers': [('Content-Type', 'text/plain')]
        },
        '/search': {
            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
            'tools.response_headers.on': True,
            'tools.response_headers.headers': [('Content-Type', 'text/plain')]
        },
        '/download': {
            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
            'tools.response_headers.on': True,
            'tools.response_headers.headers': [('Content-Type', 'text/plain')]
        },
        '/addspace': {
            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
            'tools.response_headers.on': True,
            'tools.response_headers.headers': [('Content-Type', 'text/plain')]
        },
        '/exportspace': {
            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
            'tools.response_headers.on': True,
            'tools.response_headers.headers': [('Content-Type', 'text/plain')]
        },
        '/deleteFamily': {
            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
            'tools.response_headers.on': True,
            'tools.response_headers.headers': [('Content-Type', 'text/plain')]
        },
        '/deleteVersion': {
            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
            'tools.response_headers.on': True,
            'tools.response_headers.headers': [('Content-Type', 'text/plain')]
        },
        '/importspace': {
            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
            'tools.response_headers.on': True,
            'tools.response_headers.headers': [('Content-Type', 'text/plain')]
        },
        '/clonespace': {
            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
            'tools.response_headers.on': True,
            'tools.response_headers.headers': [('Content-Type', 'text/plain')]
        },
        '/spaceInfo': {
            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
            'tools.response_headers.on': True,
            'tools.response_headers.headers': [('Content-Type', 'text/plain')]
        },
        '/static': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': './public',
        },
        'global' : {
            'server.socket_host' : '127.0.0.1',
            'server.socket_port' : 8081,
            'server.thread_pool' : 8,
        }
    }

    webapp = FlameSearch()
    webapp.info = FlameInfoWS()
    webapp.dir = FlameDirWS()
    webapp.search = FlameSearchWS()
    webapp.addspace = FlameAddspace()
    webapp.deleteFamily = FlameDeleteFamily()
    webapp.deleteVersion = FlameDeleteVersion()
    webapp.clonespace = FlameClonespace()
    webapp.importspace = FlameImportspace()
    webapp.spaceInfo = FlamespaceInfo()
    webapp.exportspace = FlameExportspace()
    webapp.download = Download()
    cherrypy.quickstart(webapp, '/', conf)
