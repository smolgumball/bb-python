# bb-python
Run Python scripts inside BitBurner! Uses [Brython](https://github.com/brython-dev/brython) to interpret and run Python. 

Example implementation in `1-brythonUsage.js` can invoke BitBurner-specific `ns` functions<br>
and properly handles async/await to avoid `ns` promise race conditions.

![image](https://user-images.githubusercontent.com/53015256/149642153-62131cc7-4c08-4c10-8136-662d300a54f5.png)

### Installation
* Copy both scripts into your BitBurner install
* `run 0-brythonEngine.js` first
* `run 1-brythonUsage.js` second
* Extend, cleanup, and use however you like!
