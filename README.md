# sFlame_ws

sFlame_ws provides a simple web interface for managing existing spaces and running similarity search. 

sFlame_ws is in active development and **no stable release has been produced so far**. Even this README is under construction, so please excuse errors and inaccuracies.

## Installing
sFlame_ws asumes that Flame (https://github.com/phi-grib/flame) is already installed and reachable in the *PYTHONPATH*. In development environments where Flame is installed in another location, the full path must be defined (hardcoded) at the top of file `sflame-ws.py`. 

The server is started by typing:

```sh
conda activate flame
cd sflame_ws/
python sflame-ws.py 
```	

To access the web graphical interface, open a web browser and enter the address *http://localhost:8081*

The web page contains two tabs

### sManage

![Alt text](images/flame-ws-smanage.png?raw=true "smanage tab")

The page is divided in three regions:
* Spaces available. A list of existing spaces and versions, in an expandable tree
* Space details. A detailed description of the space selected in the space tree view
* Tools. A toolbox with commands which can be executed

| Command | Equivalent Flame command | Description |
| --- | --- | ---|
| Clone | *python -c smanage -a publish -s NEWSPACE* | Clones the development version, creating a new version in the space repository. Versions are assigned sequential numbers |
| Export | *python -c smanage -a export -s NEWSPACE* | Exports the space entry NEWSPACE, creating a tar compressed file *NEWSPACE.tgz* which contains all the versions. |
| Delete Space| *python -c smanage -a kill -s NEWSPACE* | Removes NEWSPACE from the space repository. **Use with extreme care**, since the removal will be permanent and irreversible  |
| Delete Version | *python -c smanage -a remove -s NEWSPACE -v 2* | Removes the version specified from the NEWSPACE space repository |
| New space | *python -c smanage -a new -s NEWSPACE* | Creates a new entry in the space repository  |
| Import | *python -c smanage -a import -s NEWSPACE* | Imports file *NEWSPACE.tgz*, creating space NEWSPACE in the local space repository |

### Search

![Alt text](images/flame-ws-search.png?raw=true "Search tab")

Select a SDFile in the *Input* field, using the browse button. Select the *space* and *version* and press the *Search* button. After a short while, the results are shown in tabular format.

Results can be exported to a .tsv formatted file pressing the *Export* button.


## API

Web API services available:

(in development)

| URL | HTTP verb | Input data | Return data | HTTP status codes |
| --- | --- | --- | --- | --- |
| /info | GET | | application/json: info_message response | 200 |
| /dir | GET | | application/json: available_services response | 200 |
| /search | POST | multipart/form-data encoding: space and filename | application/json: search_call response | 200, 500 for malformed POST message |

The exact synthax of the JSON object returned by search will be documented in detail elsewhere.


## Licensing

Flame was produced at the PharmacoInformatics lab (http://phi.upf.edu), in the framework of the eTRANSAFE project (http://etransafe.eu). eTRANSAFE has received support from IMI2 Joint Undertaking under Grant Agreement No. 777365. This Joint Undertaking receives support from the European Union’s Horizon 2020 research and innovation programme and the European Federation of Pharmaceutical Industries and Associations (EFPIA). 

![Alt text](images/eTRANSAFE-logo-git.png?raw=true "eTRANSAFE-logo") ![Alt text](images/imi-logo.png?raw=true "IMI logo")

Copyright 2018 Manuel Pastor (manuel.pastor@upf.edu)

Flame is free software: you can redistribute it and/or modify it under the terms of the **GNU General Public License as published by the Free Software Foundation version 3**.

Flame is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Flame. If not, see <http://www.gnu.org/licenses/>.

