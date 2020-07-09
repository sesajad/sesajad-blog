> :Hero src=/img/2020-07-pyspark-header.svg,
>       target=desktop,
>       leak=156px


> :Title shadow=0 0 8px black, color=white
>
> PySpark Applications Dependencies

> :Author src=github

originally published in Sep 2018

(if you’re just looking for the answer, it’s at the end of the article)

let’s ignore all of the folks about the advantages and disadvantages of PySpark in comparison to spark. here is an article for whom is constrained to use PySpark.

## Problem

while exploring data you may encounter such a problem that you need to do a complex mapping process, for example, converting base64 string of images into arrays which represents an image. or even more complicated, such as embedding data using a pre-trained model to detect anomalies. first of all, we must make sure that the tasks are Map-Reduce and Big Data tasks, otherwise, we may need to handle them out of Spark.

Then, we realize that we need a third-party library to be used on the mapping task (or reduce or anything), this is the start of great pain.

## Search for Solutions

the simple dirty solution is to install the needed library on the python environments on all nodes of the cluster but please :))

after a bunch of searches, we found out that there is a method called `SparkContext.addPyFile` which as documentation said it supports .py, .zip and .egg on local, HTTP and HDFS. the very first point is that egg is dead and is succeeded by wheel. **if the library is a single file** (like gists), this function may be found useful, also if the desired library still has a fresh egg file (which I recommend to not use that library) it can be simply used by this function. (even it’s not guaranteed to work for the reason I will say)

PySpark just adds the archive to `sys.path` so, you cannot simply add .whl files to it, you must do something like pip does during installation. the best way is to call pip to extract the package.

so something like this may works

```python
import subprocess
import shutil
def install(package):
    subprocess.call([sys.executable, '-m', 'pip', '-t', '/tmp/pysparkpackages/%s/' % package]
    shutil.make_archive('/tmp/pysparkpackages/arch_%s' % package, 'zip', '/tmp/pysparkpackages/%s/' % package)
    sc.addPyFile('/tmp/pysparkpackages/arch_%s' % package)
```

note that `pip -t dir package` installs the package in dir and doesn’t add it to installed packages list (`pip freeze`)

it works, but for simple libraries. for libraries such as TensorFlow or numpy which contains .so files, this doesn’t work.

(because PySpark add_files for zip files depends on zipimport and due to [PEP0273](https://www.python.org/dev/peps/pep-0273/) “import of dynamic modules (*.pyd, *.so) is disallowed.”.

then, we realize that `sc.addPyFile` is not much useful for adding libraries, now we’re looking for a way to install library temporarily on all of the nodes.

first, to make a function run on all of the nodes, there is no simple way in spark, therefore we need to use this hack

```python
def run_on_all_workers(x)
    ... process ...
    return x
a large_rdd = a_large_rdd.mapPartitions(run_on_all_workers)
```

and now, the only way to correctly install a .whl library is to install it using pip, and one of the ways to make it temporary is to install in `SparkFiles.getRootDirectory()` which is a per-application temporary directory.

so, the final word is:

**if you want to install a third-party library such as TensorFlow on a Spark cluster, you can run following code on Zeppelin**

```python
%pyspark
def install_deps(x):
    from pyspark import SparkFiles
    from subprocess import call
    import sys
    for package in ['tensorflow', 'keras']: # or any other library
        call([sys.executable, '-m', 'pip', 'install', '-t', SparkFiles.getRootDirectory(), package])
    return x
sc.parallelize(range(0,100)).mapPartitions(install_deps).collect()
```

**you can change** `sc.parallelize(range(0,100))` **with your data RDD.**